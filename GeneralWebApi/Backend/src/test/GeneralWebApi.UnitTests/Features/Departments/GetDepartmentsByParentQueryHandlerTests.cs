using FluentAssertions;
using GeneralWebApi.Application.Features.Departments.Handlers;
using GeneralWebApi.Application.Features.Departments.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Department;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Departments;

/// <summary>
/// Unit tests for <see cref="GetDepartmentsByParentQueryHandler"/>.
/// Same enterprise-style pattern: single SUT, mocked IDepartmentService.
/// </summary>
public sealed class GetDepartmentsByParentQueryHandlerTests
{
    private readonly Mock<IDepartmentService> _departmentServiceMock;
    private readonly GetDepartmentsByParentQueryHandler _sut;

    public GetDepartmentsByParentQueryHandlerTests()
    {
        _departmentServiceMock = new Mock<IDepartmentService>();
        _sut = new GetDepartmentsByParentQueryHandler(_departmentServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsListOfDepartmentDto_WhenParentHasChildren()
    {
        const int parentId = 10;
        var items = new List<DepartmentDto>
        {
            new DepartmentDtoBuilder().WithId(11).WithName("Child A").WithParent(parentId, "Parent").Build(),
            new DepartmentDtoBuilder().WithId(12).WithName("Child B").WithParent(parentId, "Parent").Build()
        };
        _departmentServiceMock
            .Setup(s => s.GetByParentIdAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(items);

        var query = new GetDepartmentsByParentQuery { ParentId = parentId };

        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeSameAs(items);
    }

    [Fact]
    public async Task Handle_CallsDepartmentServiceWithRequestParentId_WhenInvoked()
    {
        const int parentId = 99;
        var items = new List<DepartmentDto>();
        _departmentServiceMock
            .Setup(s => s.GetByParentIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(items);

        var query = new GetDepartmentsByParentQuery { ParentId = parentId };
        await _sut.Handle(query, CancellationToken.None);

        _departmentServiceMock.Verify(
            s => s.GetByParentIdAsync(parentId, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var items = new List<DepartmentDto>();
        _departmentServiceMock
            .Setup(s => s.GetByParentIdAsync(It.IsAny<int>(), token))
            .ReturnsAsync(items);

        var query = new GetDepartmentsByParentQuery { ParentId = 1 };
        await _sut.Handle(query, token);

        _departmentServiceMock.Verify(
            s => s.GetByParentIdAsync(It.IsAny<int>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        const int parentId = 5;
        _departmentServiceMock
            .Setup(s => s.GetByParentIdAsync(parentId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Parent not found."));

        var query = new GetDepartmentsByParentQuery { ParentId = parentId };
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Parent not found.");
    }

    [Fact]
    public async Task Handle_ReturnsEmptyList_WhenParentHasNoChildren()
    {
        const int parentId = 42;
        var empty = new List<DepartmentDto>();
        _departmentServiceMock
            .Setup(s => s.GetByParentIdAsync(parentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(empty);

        var query = new GetDepartmentsByParentQuery { ParentId = parentId };
        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }
}
