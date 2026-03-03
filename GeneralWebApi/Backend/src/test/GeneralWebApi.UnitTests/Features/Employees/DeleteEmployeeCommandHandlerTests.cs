using FluentAssertions;
using GeneralWebApi.Application.Features.Employees.Commands;
using GeneralWebApi.Application.Features.Employees.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Employee;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Employees;

/// <summary>
/// Unit tests for <see cref="DeleteEmployeeCommandHandler"/>.
/// Same enterprise-style pattern: single SUT, mocked IEmployeeService,
/// Arrange-Act-Assert and interaction verification.
/// </summary>
public sealed class DeleteEmployeeCommandHandlerTests
{
    private readonly Mock<IEmployeeService> _employeeServiceMock;
    private readonly DeleteEmployeeCommandHandler _sut;

    public DeleteEmployeeCommandHandlerTests()
    {
        _employeeServiceMock = new Mock<IEmployeeService>();
        _sut = new DeleteEmployeeCommandHandler(_employeeServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsEmployeeDto_WhenDeleteSucceeds()
    {
        // Arrange: service returns the deleted employee DTO
        const int employeeId = 42;
        var deletedEmployee = new EmployeeDtoBuilder()
            .WithId(employeeId)
            .WithName("Jane", "Smith")
            .Inactive()
            .Build();

        _employeeServiceMock
            .Setup(s => s.DeleteAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(deletedEmployee);

        var command = new DeleteEmployeeCommand { Id = employeeId };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeSameAs(deletedEmployee);
        result.Id.Should().Be(employeeId);
        result.FirstName.Should().Be("Jane");
        result.LastName.Should().Be("Smith");
        result.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_CallsEmployeeServiceWithCommandId_WhenInvoked()
    {
        const int requestedId = 99;
        var employee = new EmployeeDtoBuilder().WithId(requestedId).Build();
        _employeeServiceMock
            .Setup(s => s.DeleteAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        var command = new DeleteEmployeeCommand { Id = requestedId };

        await _sut.Handle(command, CancellationToken.None);

        _employeeServiceMock.Verify(
            s => s.DeleteAsync(requestedId, It.IsAny<CancellationToken>()),
            Times.Once,
            "the handler must forward the command Id to the employee service");
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var employee = new EmployeeDtoBuilder().Build();
        _employeeServiceMock
            .Setup(s => s.DeleteAsync(It.IsAny<int>(), token))
            .ReturnsAsync(employee);

        var command = new DeleteEmployeeCommand { Id = 1 };

        await _sut.Handle(command, token);

        _employeeServiceMock.Verify(
            s => s.DeleteAsync(It.IsAny<int>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        const int employeeId = 5;
        _employeeServiceMock
            .Setup(s => s.DeleteAsync(employeeId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Delete failed."));

        var command = new DeleteEmployeeCommand { Id = employeeId };

        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Delete failed.");
    }

    [Fact]
    public async Task Handle_ReturnsServiceResultUnchanged_WhenServiceReturnsData()
    {
        const int employeeId = 7;
        var employee = new EmployeeDtoBuilder()
            .WithId(employeeId)
            .WithEmployeeNumber("EMP-007")
            .Inactive()
            .Build();

        _employeeServiceMock
            .Setup(s => s.DeleteAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        var command = new DeleteEmployeeCommand { Id = employeeId };

        var result = await _sut.Handle(command, CancellationToken.None);

        result.Should().BeSameAs(employee);
        result.EmployeeNumber.Should().Be("EMP-007");
        result.IsActive.Should().BeFalse();
    }
}
