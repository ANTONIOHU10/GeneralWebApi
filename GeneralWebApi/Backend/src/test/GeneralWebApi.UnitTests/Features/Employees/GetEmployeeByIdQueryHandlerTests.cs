using FluentAssertions;
using GeneralWebApi.Application.Features.Employees.Handlers;
using GeneralWebApi.Application.Features.Employees.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Employee;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Employees;

/// <summary>
/// Unit tests for <see cref="GetEmployeeByIdQueryHandler"/>.
/// Demonstrates enterprise-style handler testing: single SUT, mocked dependencies,
/// Arrange-Act-Assert, FluentAssertions, and verification of interactions.
/// </summary>
public sealed class GetEmployeeByIdQueryHandlerTests
{
    private readonly Mock<IEmployeeService> _employeeServiceMock;
    private readonly GetEmployeeByIdQueryHandler _sut;

    public GetEmployeeByIdQueryHandlerTests()
    {
        _employeeServiceMock = new Mock<IEmployeeService>();
        _sut = new GetEmployeeByIdQueryHandler(_employeeServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsEmployeeDto_WhenEmployeeExists()
    {
        // Arrange: build predictable test data and set up the only dependency
        const int employeeId = 42;
        var expectedEmployee = new EmployeeDtoBuilder()
            .WithId(employeeId)
            .WithName("Jane", "Smith")
            .WithEmail("jane.smith@example.com")
            .Build();

        _employeeServiceMock
            .Setup(s => s.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedEmployee);

        var query = new GetEmployeeByIdQuery { Id = employeeId };
        var cancellationToken = new CancellationToken();

        // Act: invoke the handler (single responsibility under test)
        var result = await _sut.Handle(query, cancellationToken);

        // Assert: verify outcome with FluentAssertions for clear failure messages
        result.Should().NotBeNull();
        result.Should().BeSameAs(expectedEmployee);
        result.Id.Should().Be(employeeId);
        result.FirstName.Should().Be("Jane");
        result.LastName.Should().Be("Smith");
        result.Email.Should().Be("jane.smith@example.com");
        result.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_CallsEmployeeServiceWithRequestId_WhenInvoked()
    {
        // Arrange: ensure we can verify the exact id passed to the service
        const int requestedId = 99;
        var employee = new EmployeeDtoBuilder().WithId(requestedId).Build();
        _employeeServiceMock
            .Setup(s => s.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        var query = new GetEmployeeByIdQuery { Id = requestedId };

        // Act
        await _sut.Handle(query, CancellationToken.None);

        // Assert: interaction verification — service must be called exactly once with the query id
        _employeeServiceMock.Verify(
            s => s.GetByIdAsync(requestedId, It.IsAny<CancellationToken>()),
            Times.Once,
            "the handler must forward the query Id to the employee service");
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        // Arrange: use a custom token to prove it is passed through
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var employee = new EmployeeDtoBuilder().Build();
        _employeeServiceMock
            .Setup(s => s.GetByIdAsync(It.IsAny<int>(), token))
            .ReturnsAsync(employee);

        var query = new GetEmployeeByIdQuery { Id = 1 };

        // Act
        await _sut.Handle(query, token);

        // Assert: handler must pass the same cancellation token to the service
        _employeeServiceMock.Verify(
            s => s.GetByIdAsync(It.IsAny<int>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        // Arrange: simulate service failure (e.g. database error, not found thrown as exception)
        const int employeeId = 5;
        var expectedException = new InvalidOperationException("Employee repository error.");
        _employeeServiceMock
            .Setup(s => s.GetByIdAsync(employeeId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(expectedException);

        var query = new GetEmployeeByIdQuery { Id = employeeId };

        // Act
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        // Assert: handler does not swallow exceptions; caller (e.g. pipeline) can handle them
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Employee repository error.");
    }

    [Fact]
    public async Task Handle_ReturnsServiceResultUnchanged_WhenServiceReturnsData()
    {
        // Arrange: handler is a pass-through; result must be the same reference/instance
        var employee = new EmployeeDtoBuilder()
            .WithId(7)
            .WithEmployeeNumber("EMP-007")
            .Inactive()
            .Build();

        _employeeServiceMock
            .Setup(s => s.GetByIdAsync(7, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        var query = new GetEmployeeByIdQuery { Id = 7 };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert: no mapping or mutation; same instance and all fields preserved
        result.Should().BeSameAs(employee);
        result.EmployeeNumber.Should().Be("EMP-007");
        result.IsActive.Should().BeFalse();
        result.EmploymentStatus.Should().Be("Inactive");
    }
}
