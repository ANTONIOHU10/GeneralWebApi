using FluentAssertions;
using GeneralWebApi.Application.Features.Employees.Handlers;
using GeneralWebApi.Application.Features.Employees.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Employee;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Employees;

/// <summary>
/// Unit tests for <see cref="SearchEmployeesQueryHandler"/>.
/// Handler uses the incoming EmployeeSearchDto (including paging) and returns Items list.
/// </summary>
public sealed class SearchEmployeesQueryHandlerTests
{
    private readonly Mock<IEmployeeService> _employeeServiceMock;
    private readonly SearchEmployeesQueryHandler _sut;

    public SearchEmployeesQueryHandlerTests()
    {
        _employeeServiceMock = new Mock<IEmployeeService>();
        _sut = new SearchEmployeesQueryHandler(_employeeServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsListOfEmployeeDto_WhenServiceReturnsPagedResult()
    {
        var searchDto = new EmployeeSearchDtoBuilder().WithSearchTerm("john").WithPage(1, 5).Build();
        var items = new List<EmployeeDto>
        {
            new EmployeeDtoBuilder().WithId(1).WithName("John", "Doe").Build(),
            new EmployeeDtoBuilder().WithId(2).WithName("Johnny", "Smith").Build()
        };
        var paged = new PagedResult<EmployeeDto>(items, 2, searchDto.PageNumber, searchDto.PageSize);
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(paged);

        var query = new SearchEmployeesQuery { EmployeeSearchDto = searchDto };

        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result[0].FirstName.Should().Be("John");
        result[1].FirstName.Should().Be("Johnny");
    }

    [Fact]
    public async Task Handle_CallsServiceWithIncomingSearchDto_WhenInvoked()
    {
        var searchDto = new EmployeeSearchDtoBuilder().WithPage(2, 10).Build();
        var paged = new PagedResult<EmployeeDto>([], 0, searchDto.PageNumber, searchDto.PageSize);
        EmployeeSearchDto? capturedDto = null;
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), It.IsAny<CancellationToken>()))
            .Callback<EmployeeSearchDto, CancellationToken>((dto, _) => capturedDto = dto)
            .ReturnsAsync(paged);

        var query = new SearchEmployeesQuery { EmployeeSearchDto = searchDto };
        await _sut.Handle(query, CancellationToken.None);

        capturedDto.Should().NotBeNull();
        capturedDto!.PageNumber.Should().Be(searchDto.PageNumber);
        capturedDto.PageSize.Should().Be(searchDto.PageSize);
        capturedDto.SearchTerm.Should().Be(searchDto.SearchTerm);
        capturedDto.DepartmentId.Should().Be(searchDto.DepartmentId);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var searchDto = new EmployeeSearchDtoBuilder().Build();
        var paged = new PagedResult<EmployeeDto>([], 0, 1, 10);
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), token))
            .ReturnsAsync(paged);

        var query = new SearchEmployeesQuery { EmployeeSearchDto = searchDto };
        await _sut.Handle(query, token);

        _employeeServiceMock.Verify(
            s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        var searchDto = new EmployeeSearchDtoBuilder().Build();
        var query = new SearchEmployeesQuery { EmployeeSearchDto = searchDto };
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Search failed."));

        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Search failed.");
    }

    [Fact]
    public async Task Handle_ReturnsEmptyList_WhenServiceReturnsEmptyPagedResult()
    {
        var searchDto = new EmployeeSearchDtoBuilder().WithSearchTerm("nonexistent").Build();
        var emptyPaged = new PagedResult<EmployeeDto>([], 0, 1, int.MaxValue);
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyPaged);

        var query = new SearchEmployeesQuery { EmployeeSearchDto = searchDto };
        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }
}
