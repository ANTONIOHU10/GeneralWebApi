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
/// Unit tests for <see cref="GetEmployeesByDepartmentQueryHandler"/>.
/// Handler builds EmployeeSearchDto with DepartmentId and PageSize = int.MaxValue, returns Items list.
/// </summary>
public sealed class GetEmployeesByDepartmentQueryHandlerTests
{
    private readonly Mock<IEmployeeService> _employeeServiceMock;
    private readonly GetEmployeesByDepartmentQueryHandler _sut;

    public GetEmployeesByDepartmentQueryHandlerTests()
    {
        _employeeServiceMock = new Mock<IEmployeeService>();
        _sut = new GetEmployeesByDepartmentQueryHandler(_employeeServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsListOfEmployeeDto_WhenDepartmentHasEmployees()
    {
        const int departmentId = 10;
        var items = new List<EmployeeDto>
        {
            new EmployeeDtoBuilder().WithId(1).Build(),
            new EmployeeDtoBuilder().WithId(2).Build()
        };
        var paged = new PagedResult<EmployeeDto>(items, 2, 1, int.MaxValue);
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(paged);

        var query = new GetEmployeesByDepartmentQuery { DepartmentId = departmentId };

        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().HaveCount(2);
    }

    [Fact]
    public async Task Handle_CallsServiceWithDepartmentIdAndPageSizeMaxValue_WhenInvoked()
    {
        const int departmentId = 99;
        var paged = new PagedResult<EmployeeDto>([], 0, 1, int.MaxValue);
        EmployeeSearchDto? capturedDto = null;
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), It.IsAny<CancellationToken>()))
            .Callback<EmployeeSearchDto, CancellationToken>((dto, _) => capturedDto = dto)
            .ReturnsAsync(paged);

        var query = new GetEmployeesByDepartmentQuery { DepartmentId = departmentId };
        await _sut.Handle(query, CancellationToken.None);

        capturedDto.Should().NotBeNull();
        capturedDto!.DepartmentId.Should().Be(departmentId);
        capturedDto.PageNumber.Should().Be(1);
        capturedDto.PageSize.Should().Be(int.MaxValue);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var paged = new PagedResult<EmployeeDto>([], 0, 1, 10);
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), token))
            .ReturnsAsync(paged);

        var query = new GetEmployeesByDepartmentQuery { DepartmentId = 1 };
        await _sut.Handle(query, token);

        _employeeServiceMock.Verify(
            s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        var query = new GetEmployeesByDepartmentQuery { DepartmentId = 5 };
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Department query failed."));

        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Department query failed.");
    }

    [Fact]
    public async Task Handle_ReturnsEmptyList_WhenDepartmentHasNoEmployees()
    {
        var emptyPaged = new PagedResult<EmployeeDto>([], 0, 1, int.MaxValue);
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyPaged);

        var query = new GetEmployeesByDepartmentQuery { DepartmentId = 42 };
        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }
}
