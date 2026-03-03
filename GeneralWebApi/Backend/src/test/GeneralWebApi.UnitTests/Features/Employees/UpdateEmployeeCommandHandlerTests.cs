using FluentAssertions;
using GeneralWebApi.Application.Features.Employees.Commands;
using GeneralWebApi.Application.Features.Employees.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Employee;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Employees;

/// <summary>
/// Unit tests for <see cref="UpdateEmployeeCommandHandler"/>.
/// Same enterprise-style pattern: single SUT, mocked IEmployeeService,
/// Arrange-Act-Assert and interaction verification.
/// </summary>
public sealed class UpdateEmployeeCommandHandlerTests
{
    private readonly Mock<IEmployeeService> _employeeServiceMock;
    private readonly UpdateEmployeeCommandHandler _sut;

    public UpdateEmployeeCommandHandlerTests()
    {
        _employeeServiceMock = new Mock<IEmployeeService>();
        _sut = new UpdateEmployeeCommandHandler(_employeeServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsEmployeeDto_WhenUpdateSucceeds()
    {
        // Arrange: update DTO and expected result
        const int employeeId = 50;
        var updateDto = new UpdateEmployeeDtoBuilder()
            .WithId(employeeId)
            .WithName("Jane", "Smith")
            .WithEmail("jane.smith@example.com")
            .Build();

        var expectedEmployee = new EmployeeDtoBuilder()
            .WithId(employeeId)
            .WithName("Jane", "Smith")
            .WithEmail("jane.smith@example.com")
            .Build();

        _employeeServiceMock
            .Setup(s => s.UpdateAsync(employeeId, updateDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedEmployee);

        var command = new UpdateEmployeeCommand { UpdateEmployeeDto = updateDto };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeSameAs(expectedEmployee);
        result.Id.Should().Be(employeeId);
        result.FirstName.Should().Be("Jane");
        result.LastName.Should().Be("Smith");
        result.Email.Should().Be("jane.smith@example.com");
    }

    [Fact]
    public async Task Handle_CallsEmployeeServiceWithIdAndUpdateDto_WhenInvoked()
    {
        // Arrange: verify handler passes correct id and DTO to service
        const int employeeId = 99;
        var updateDto = new UpdateEmployeeDtoBuilder()
            .WithId(employeeId)
            .WithName("Alice", "Johnson")
            .Build();

        var employee = new EmployeeDtoBuilder().WithId(employeeId).Build();
        _employeeServiceMock
            .Setup(s => s.UpdateAsync(It.IsAny<int>(), It.IsAny<UpdateEmployeeDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        var command = new UpdateEmployeeCommand { UpdateEmployeeDto = updateDto };

        // Act
        await _sut.Handle(command, CancellationToken.None);

        // Assert: service called with request id and same DTO reference
        _employeeServiceMock.Verify(
            s => s.UpdateAsync(
                employeeId,
                It.Is<UpdateEmployeeDto>(dto => ReferenceEquals(dto, updateDto)),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var updateDto = new UpdateEmployeeDtoBuilder().WithId(1).Build();
        var employee = new EmployeeDtoBuilder().Build();

        _employeeServiceMock
            .Setup(s => s.UpdateAsync(1, It.IsAny<UpdateEmployeeDto>(), token))
            .ReturnsAsync(employee);

        var command = new UpdateEmployeeCommand { UpdateEmployeeDto = updateDto };

        await _sut.Handle(command, token);

        _employeeServiceMock.Verify(
            s => s.UpdateAsync(It.IsAny<int>(), It.IsAny<UpdateEmployeeDto>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        const int employeeId = 5;
        var updateDto = new UpdateEmployeeDtoBuilder().WithId(employeeId).Build();
        var command = new UpdateEmployeeCommand { UpdateEmployeeDto = updateDto };

        _employeeServiceMock
            .Setup(s => s.UpdateAsync(employeeId, updateDto, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Update failed."));

        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Update failed.");
    }

    [Fact]
    public async Task Handle_ReturnsServiceResultUnchanged_WhenServiceReturnsData()
    {
        const int employeeId = 7;
        var updateDto = new UpdateEmployeeDtoBuilder()
            .WithId(employeeId)
            .WithName("Bob", "Taylor")
            .WithTermination(DateTime.UtcNow.AddDays(-1), "Inactive")
            .Build();

        var employee = new EmployeeDtoBuilder()
            .WithId(employeeId)
            .WithName("Bob", "Taylor")
            .Inactive()
            .Build();

        _employeeServiceMock
            .Setup(s => s.UpdateAsync(employeeId, updateDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        var command = new UpdateEmployeeCommand { UpdateEmployeeDto = updateDto };

        var result = await _sut.Handle(command, CancellationToken.None);

        result.Should().BeSameAs(employee);
        result.Id.Should().Be(employeeId);
        result.IsActive.Should().BeFalse();
        result.EmploymentStatus.Should().Be("Inactive");
    }
}
