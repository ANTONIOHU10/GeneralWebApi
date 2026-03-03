using FluentAssertions;
using GeneralWebApi.Application.Features.Employees.Handlers;
using GeneralWebApi.Application.Features.Employees.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Employee;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Employees;

/// <summary>
/// Unit tests for <see cref="GetEmployeeHierarchyQueryHandler"/>.
/// Same enterprise-style pattern: single SUT, mocked IEmployeeService.
/// </summary>
public sealed class GetEmployeeHierarchyQueryHandlerTests
{
    private readonly Mock<IEmployeeService> _employeeServiceMock;
    private readonly GetEmployeeHierarchyQueryHandler _sut;

    public GetEmployeeHierarchyQueryHandlerTests()
    {
        _employeeServiceMock = new Mock<IEmployeeService>();
        _sut = new GetEmployeeHierarchyQueryHandler(_employeeServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsEmployeeHierarchyDto_WhenEmployeeHasHierarchy()
    {
        const int employeeId = 42;
        var hierarchy = new EmployeeHierarchyDto
        {
            Id = employeeId,
            FirstName = "Jane",
            LastName = "Smith",
            EmployeeNumber = "EMP-042",
            Email = "jane@example.com",
            PositionTitle = "Lead",
            DepartmentName = "Engineering",
            IsManager = true,
            EmploymentStatus = "Active",
            Subordinates = new List<EmployeeHierarchyDto>()
        };
        _employeeServiceMock
            .Setup(s => s.GetHierarchyAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(hierarchy);

        var query = new GetEmployeeHierarchyQuery { EmployeeId = employeeId };

        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().BeSameAs(hierarchy);
        result!.Id.Should().Be(employeeId);
        result.FirstName.Should().Be("Jane");
        result.LastName.Should().Be("Smith");
        result.IsManager.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_ReturnsNull_WhenEmployeeHasNoHierarchy()
    {
        const int employeeId = 7;
        _employeeServiceMock
            .Setup(s => s.GetHierarchyAsync(employeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((EmployeeHierarchyDto?)null);

        var query = new GetEmployeeHierarchyQuery { EmployeeId = employeeId };

        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_CallsEmployeeServiceWithRequestEmployeeId_WhenInvoked()
    {
        const int requestedId = 99;
        var hierarchy = new EmployeeHierarchyDto { Id = requestedId, FirstName = "A", LastName = "B", EmployeeNumber = "E", EmploymentStatus = "Active" };
        _employeeServiceMock
            .Setup(s => s.GetHierarchyAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(hierarchy);

        var query = new GetEmployeeHierarchyQuery { EmployeeId = requestedId };
        await _sut.Handle(query, CancellationToken.None);

        _employeeServiceMock.Verify(
            s => s.GetHierarchyAsync(requestedId, It.IsAny<CancellationToken>()),
            Times.Once,
            "the handler must forward the query EmployeeId to the employee service");
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var hierarchy = new EmployeeHierarchyDto { Id = 1, FirstName = "X", LastName = "Y", EmployeeNumber = "E", EmploymentStatus = "Active" };
        _employeeServiceMock
            .Setup(s => s.GetHierarchyAsync(It.IsAny<int>(), token))
            .ReturnsAsync(hierarchy);

        var query = new GetEmployeeHierarchyQuery { EmployeeId = 1 };
        await _sut.Handle(query, token);

        _employeeServiceMock.Verify(
            s => s.GetHierarchyAsync(It.IsAny<int>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        const int employeeId = 5;
        _employeeServiceMock
            .Setup(s => s.GetHierarchyAsync(employeeId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Hierarchy load failed."));

        var query = new GetEmployeeHierarchyQuery { EmployeeId = employeeId };

        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Hierarchy load failed.");
    }
}
