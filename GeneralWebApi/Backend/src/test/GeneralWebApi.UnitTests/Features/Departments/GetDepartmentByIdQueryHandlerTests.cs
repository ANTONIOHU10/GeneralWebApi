using FluentAssertions;
using GeneralWebApi.Application.Features.Departments.Handlers;
using GeneralWebApi.Application.Features.Departments.Queries;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Department;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Departments;

/// <summary>
/// Unit tests for <see cref="GetDepartmentByIdQueryHandler"/>.
/// Same enterprise-style pattern: single SUT, mocked IDepartmentService.
/// </summary>
public sealed class GetDepartmentByIdQueryHandlerTests
{
    private readonly Mock<IDepartmentService> _departmentServiceMock;
    private readonly GetDepartmentByIdQueryHandler _sut;

    public GetDepartmentByIdQueryHandlerTests()
    {
        _departmentServiceMock = new Mock<IDepartmentService>();
        _sut = new GetDepartmentByIdQueryHandler(_departmentServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsDepartmentDto_WhenDepartmentExists()
    {
        const int departmentId = 42;
        var expected = new DepartmentDtoBuilder()
            .WithId(departmentId)
            .WithName("Engineering")
            .WithCode("ENG")
            .Build();

        _departmentServiceMock
            .Setup(s => s.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var query = new GetDepartmentByIdQuery { Id = departmentId };

        var result = await _sut.Handle(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().BeSameAs(expected);
        result.Id.Should().Be(departmentId);
        result.Name.Should().Be("Engineering");
        result.Code.Should().Be("ENG");
    }

    [Fact]
    public async Task Handle_CallsDepartmentServiceWithRequestId_WhenInvoked()
    {
        const int requestedId = 99;
        var department = new DepartmentDtoBuilder().WithId(requestedId).Build();
        _departmentServiceMock
            .Setup(s => s.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(department);

        var query = new GetDepartmentByIdQuery { Id = requestedId };
        await _sut.Handle(query, CancellationToken.None);

        _departmentServiceMock.Verify(
            s => s.GetByIdAsync(requestedId, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var department = new DepartmentDtoBuilder().Build();
        _departmentServiceMock
            .Setup(s => s.GetByIdAsync(It.IsAny<int>(), token))
            .ReturnsAsync(department);

        var query = new GetDepartmentByIdQuery { Id = 1 };
        await _sut.Handle(query, token);

        _departmentServiceMock.Verify(
            s => s.GetByIdAsync(It.IsAny<int>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        const int departmentId = 5;
        _departmentServiceMock
            .Setup(s => s.GetByIdAsync(departmentId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Department not found."));

        var query = new GetDepartmentByIdQuery { Id = departmentId };
        Func<Task> act = () => _sut.Handle(query, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Department not found.");
    }
}
