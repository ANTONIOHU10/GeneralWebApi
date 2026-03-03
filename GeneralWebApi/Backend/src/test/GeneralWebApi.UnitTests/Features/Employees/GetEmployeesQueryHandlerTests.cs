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
/// Unit tests for <see cref="GetEmployeesQueryHandler"/>.
/// Same enterprise-style pattern: single SUT, mocked IEmployeeService,
/// Arrange-Act-Assert and interaction verification.
/// </summary>
public sealed class GetEmployeesQueryHandlerTests
{
    private readonly Mock<IEmployeeService> _employeeServiceMock;
    private readonly GetEmployeesQueryHandler _sut;

    public GetEmployeesQueryHandlerTests()
    {
        _employeeServiceMock = new Mock<IEmployeeService>();
        _sut = new GetEmployeesQueryHandler(_employeeServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsPagedResult_WhenServiceReturnsData()
    {
        // Arrange: search DTO and expected paged result
        var searchDto = new EmployeeSearchDtoBuilder()
            .WithPage(1, 20)
            .WithDepartment(10)
            .Build();

        var items = new List<EmployeeDto>
        {
            new EmployeeDtoBuilder().WithId(1).WithName("Jane", "Doe").Build(),
            new EmployeeDtoBuilder().WithId(2).WithName("John", "Smith").Build()
        };
        var expectedPaged = new PagedResult<EmployeeDto>(items, totalCount: 2, pageNumber: 1, pageSize: 20);

        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(searchDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedPaged);

        var query = new GetEmployeesQuery { EmployeeSearchDto = searchDto };

        // Act
        var result = await _sut.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeSameAs(expectedPaged);
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.PageNumber.Should().Be(1);
        result.PageSize.Should().Be(20);
    }

    [Fact]
    public async Task Handle_CallsEmployeeServiceWithQuerySearchDto_WhenInvoked()
    {
        var searchDto = new EmployeeSearchDtoBuilder().WithPage(2, 10).WithSearchTerm("test").Build();
        var paged = new PagedResult<EmployeeDto>([], 0, 2, 10);
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(paged);

        var query = new GetEmployeesQuery { EmployeeSearchDto = searchDto };

        await _sut.Handle(query, CancellationToken.None);

        _employeeServiceMock.Verify(
            s => s.GetPagedAsync(
                It.Is<EmployeeSearchDto>(dto => ReferenceEquals(dto, searchDto)),
                It.IsAny<CancellationToken>()),
            Times.Once);
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

        var query = new GetEmployeesQuery { EmployeeSearchDto = searchDto };

        await _sut.Handle(query, token);

        _employeeServiceMock.Verify(
            s => s.GetPagedAsync(It.IsAny<EmployeeSearchDto>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        var searchDto = new EmployeeSearchDtoBuilder().Build();
        var query = new GetEmployeesQuery { EmployeeSearchDto = searchDto };
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(searchDto, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Paged query failed."));

        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Paged query failed.");
    }

    [Fact]
    public async Task Handle_ReturnsEmptyPagedResult_WhenServiceReturnsNoItems()
    {
        var searchDto = new EmployeeSearchDtoBuilder().WithPage(1, 10).Build();
        var emptyPaged = new PagedResult<EmployeeDto>([], 0, 1, 10);
        _employeeServiceMock
            .Setup(s => s.GetPagedAsync(searchDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(emptyPaged);

        var query = new GetEmployeesQuery { EmployeeSearchDto = searchDto };

        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }
}
