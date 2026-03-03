using FluentAssertions;
using GeneralWebApi.Application.Features.Departments.Handlers;
using GeneralWebApi.Application.Features.Departments.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Department;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Departments;

/// <summary>
/// Unit tests for <see cref="GetDepartmentHierarchyQueryHandler"/>.
/// Handler calls IDepartmentService.GetHierarchyAsync(cancellationToken) with no request params.
/// </summary>
public sealed class GetDepartmentHierarchyQueryHandlerTests
{
    private readonly Mock<IDepartmentService> _departmentServiceMock;
    private readonly GetDepartmentHierarchyQueryHandler _sut;

    public GetDepartmentHierarchyQueryHandlerTests()
    {
        _departmentServiceMock = new Mock<IDepartmentService>();
        _sut = new GetDepartmentHierarchyQueryHandler(_departmentServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsListOfDepartmentDto_WhenHierarchyExists()
    {
        var hierarchy = new List<DepartmentDto>
        {
            new DepartmentDtoBuilder().WithId(1).WithName("Root").WithLevel(0).Build(),
            new DepartmentDtoBuilder().WithId(2).WithName("Child").WithParent(1, "Root").WithLevel(1).Build()
        };
        _departmentServiceMock
            .Setup(s => s.GetHierarchyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(hierarchy);

        var query = new GetDepartmentHierarchyQuery();

        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeSameAs(hierarchy);
    }

    [Fact]
    public async Task Handle_CallsDepartmentServiceGetHierarchy_WhenInvoked()
    {
        var hierarchy = new List<DepartmentDto>();
        _departmentServiceMock
            .Setup(s => s.GetHierarchyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(hierarchy);

        var query = new GetDepartmentHierarchyQuery();
        await _sut.Handle(query, CancellationToken.None);

        _departmentServiceMock.Verify(
            s => s.GetHierarchyAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var hierarchy = new List<DepartmentDto>();
        _departmentServiceMock
            .Setup(s => s.GetHierarchyAsync(token))
            .ReturnsAsync(hierarchy);

        var query = new GetDepartmentHierarchyQuery();
        await _sut.Handle(query, token);

        _departmentServiceMock.Verify(
            s => s.GetHierarchyAsync(token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        _departmentServiceMock
            .Setup(s => s.GetHierarchyAsync(It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Hierarchy load failed."));

        var query = new GetDepartmentHierarchyQuery();
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Hierarchy load failed.");
    }

    [Fact]
    public async Task Handle_ReturnsEmptyList_WhenNoDepartments()
    {
        var empty = new List<DepartmentDto>();
        _departmentServiceMock
            .Setup(s => s.GetHierarchyAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(empty);

        var query = new GetDepartmentHierarchyQuery();
        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }
}
