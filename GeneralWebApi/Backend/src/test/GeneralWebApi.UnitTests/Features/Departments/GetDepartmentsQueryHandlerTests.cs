using FluentAssertions;
using GeneralWebApi.Application.Features.Departments.Handlers;
using GeneralWebApi.Application.Features.Departments.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Department;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Departments;

public sealed class GetDepartmentsQueryHandlerTests
{
    private readonly Mock<IDepartmentService> _departmentServiceMock;
    private readonly GetDepartmentsQueryHandler _sut;

    public GetDepartmentsQueryHandlerTests()
    {
        _departmentServiceMock = new Mock<IDepartmentService>();
        _sut = new GetDepartmentsQueryHandler(_departmentServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsPagedResult_WhenServiceReturnsData()
    {
        var searchDto = new DepartmentSearchDtoBuilder().WithPage(1, 20).WithSearchTerm("eng").Build();
        var items = new List<DepartmentListDto>
        {
            new() { Id = 1, Name = "Engineering", Code = "ENG", Description = "", Level = 1, Path = "/1", EmployeeCount = 5, PositionCount = 3 }
        };
        var expectedPaged = new PagedResult<DepartmentListDto>(items, 1, 1, 20);

        _departmentServiceMock.Setup(s => s.GetPagedAsync(searchDto, It.IsAny<CancellationToken>())).ReturnsAsync(expectedPaged);
        var query = new GetDepartmentsQuery { DepartmentSearchDto = searchDto };
        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().NotBeNull().And.BeSameAs(expectedPaged);
        result.Items.Should().HaveCount(1);
        result.TotalCount.Should().Be(1);
    }

    [Fact]
    public async Task Handle_CallsDepartmentServiceWithQuerySearchDto_WhenInvoked()
    {
        var searchDto = new DepartmentSearchDtoBuilder().WithPage(2, 10).Build();
        var paged = new PagedResult<DepartmentListDto>(new List<DepartmentListDto>(), 0, 2, 10);
        _departmentServiceMock.Setup(s => s.GetPagedAsync(It.IsAny<DepartmentSearchDto>(), It.IsAny<CancellationToken>())).ReturnsAsync(paged);
        var query = new GetDepartmentsQuery { DepartmentSearchDto = searchDto };
        await _sut.Handle(query, CancellationToken.None);
        _departmentServiceMock.Verify(s => s.GetPagedAsync(It.Is<DepartmentSearchDto>(dto => ReferenceEquals(dto, searchDto)), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var searchDto = new DepartmentSearchDtoBuilder().Build();
        var paged = new PagedResult<DepartmentListDto>(new List<DepartmentListDto>(), 0, 1, 10);
        _departmentServiceMock.Setup(s => s.GetPagedAsync(It.IsAny<DepartmentSearchDto>(), token)).ReturnsAsync(paged);
        var query = new GetDepartmentsQuery { DepartmentSearchDto = searchDto };
        await _sut.Handle(query, token);
        _departmentServiceMock.Verify(s => s.GetPagedAsync(It.IsAny<DepartmentSearchDto>(), token), Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        var searchDto = new DepartmentSearchDtoBuilder().Build();
        var query = new GetDepartmentsQuery { DepartmentSearchDto = searchDto };
        _departmentServiceMock.Setup(s => s.GetPagedAsync(searchDto, It.IsAny<CancellationToken>())).ThrowsAsync(new InvalidOperationException("Paged query failed."));
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>().WithMessage("Paged query failed.");
    }
}
