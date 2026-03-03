using FluentAssertions;
using GeneralWebApi.Application.Features.Employees.Commands;
using GeneralWebApi.Application.Features.Employees.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Employee;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Employees;

/// <summary>
/// Unit tests for <see cref="CreateEmployeeCommandHandler"/>.
/// Follows the same enterprise-style pattern as GetEmployeeByIdQueryHandlerTests:
/// single SUT, mocked dependencies, Arrange-Act-Assert and interaction verification.
/// </summary>
public sealed class CreateEmployeeCommandHandlerTests
{
    private readonly Mock<IEmployeeService> _employeeServiceMock;
    private readonly CreateEmployeeCommandHandler _sut;

    public CreateEmployeeCommandHandlerTests()
    {
        _employeeServiceMock = new Mock<IEmployeeService>();
        _sut = new CreateEmployeeCommandHandler(_employeeServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsEmployeeDto_WhenCreationSucceeds()
    {
        // Arrange: build command payload and expected result
        var createDto = new CreateEmployeeDtoBuilder()
            .WithName("Jane", "Smith")
            .WithEmail("jane.smith@example.com")
            .WithTaxCode("TAXCODE999")
            .Build();

        var expectedEmployee = new EmployeeDtoBuilder()
            .WithId(100)
            .WithName("Jane", "Smith")
            .WithEmail("jane.smith@example.com")
            .Build();

        _employeeServiceMock
            .Setup(s => s.CreateAsync(createDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedEmployee);

        var command = new CreateEmployeeCommand { CreateEmployeeDto = createDto };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeSameAs(expectedEmployee);
        result.Id.Should().Be(100);
        result.FirstName.Should().Be("Jane");
        result.LastName.Should().Be("Smith");
        result.Email.Should().Be("jane.smith@example.com");
    }

    [Fact]
    public async Task Handle_CallsEmployeeServiceWithCommandDto_WhenInvoked()
    {
        // Arrange: we want to ensure the handler passes the same DTO instance to the service
        var createDto = new CreateEmployeeDtoBuilder()
            .WithName("Alice", "Johnson")
            .WithEmail("alice.johnson@example.com")
            .Build();

        var employee = new EmployeeDtoBuilder().WithId(200).Build();

        _employeeServiceMock
            .Setup(s => s.CreateAsync(It.IsAny<CreateEmployeeDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        var command = new CreateEmployeeCommand { CreateEmployeeDto = createDto };

        // Act
        await _sut.Handle(command, CancellationToken.None);

        // Assert: service must be called exactly once with the same DTO reference
        _employeeServiceMock.Verify(
            s => s.CreateAsync(
                It.Is<CreateEmployeeDto>(dto => ReferenceEquals(dto, createDto)),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        // Arrange: use a specific token instance to verify it is forwarded
        var cts = new CancellationTokenSource();
        var token = cts.Token;

        var createDto = new CreateEmployeeDtoBuilder().Build();
        var employee = new EmployeeDtoBuilder().Build();

        _employeeServiceMock
            .Setup(s => s.CreateAsync(It.IsAny<CreateEmployeeDto>(), token))
            .ReturnsAsync(employee);

        var command = new CreateEmployeeCommand { CreateEmployeeDto = createDto };

        // Act
        await _sut.Handle(command, token);

        // Assert: handler must pass the same cancellation token to the service
        _employeeServiceMock.Verify(
            s => s.CreateAsync(It.IsAny<CreateEmployeeDto>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        // Arrange: simulate service failure during employee creation
        var createDto = new CreateEmployeeDtoBuilder().Build();
        var command = new CreateEmployeeCommand { CreateEmployeeDto = createDto };

        var expectedException = new InvalidOperationException("Employee creation failed.");

        _employeeServiceMock
            .Setup(s => s.CreateAsync(createDto, It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert: handler must not swallow the exception
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Employee creation failed.");
    }

    [Fact]
    public async Task Handle_ReturnsServiceResultUnchanged_WhenServiceReturnsData()
    {
        // Arrange: handler is a thin pass-through; result should be the same instance
        var createDto = new CreateEmployeeDtoBuilder()
            .WithName("Bob", "Taylor")
            .WithEmail("bob.taylor@example.com")
            .Build();

        var employee = new EmployeeDtoBuilder()
            .WithId(300)
            .WithName("Bob", "Taylor")
            .WithEmail("bob.taylor@example.com")
            .Inactive()
            .Build();

        _employeeServiceMock
            .Setup(s => s.CreateAsync(createDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        var command = new CreateEmployeeCommand { CreateEmployeeDto = createDto };

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert: same instance and key fields preserved
        result.Should().BeSameAs(employee);
        result.Id.Should().Be(300);
        result.IsActive.Should().BeFalse();
        result.EmploymentStatus.Should().Be("Inactive");
    }
}

