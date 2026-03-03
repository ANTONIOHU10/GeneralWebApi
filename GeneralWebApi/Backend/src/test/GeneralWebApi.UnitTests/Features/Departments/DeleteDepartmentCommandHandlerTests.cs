using FluentAssertions;
using GeneralWebApi.Application.Features.Departments.Commands;
using GeneralWebApi.Application.Features.Departments.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Department;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Departments;

/// <summary>
/// Unit tests for <see cref="DeleteDepartmentCommandHandler"/>.
/// Same enterprise-style pattern: single SUT, mocked IDepartmentService.
/// </summary>
public sealed class DeleteDepartmentCommandHandlerTests
{
    private readonly Mock<IDepartmentService> _departmentServiceMock;
    private readonly DeleteDepartmentCommandHandler _sut;

    public DeleteDepartmentCommandHandlerTests()
    {
        _departmentServiceMock = new Mock<IDepartmentService>();
        _sut = new DeleteDepartmentCommandHandler(_departmentServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsDepartmentDto_WhenDeleteSucceeds()
    {
        const int departmentId = 42;
        var deleted = new DepartmentDtoBuilder()
            .WithId(departmentId)
            .WithName("Deleted Dept")
            .WithCode("DEL")
            .Build();

        _departmentServiceMock
            .Setup(s => s.DeleteAsync(departmentId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(deleted);

        var command = new DeleteDepartmentCommand { Id = departmentId };

        var result = await _sut.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().BeSameAs(deleted);
        result.Id.Should().Be(departmentId);
    }

    [Fact]
    public async Task Handle_CallsDepartmentServiceWithCommandId_WhenInvoked()
    {
        const int requestedId = 99;
        var department = new DepartmentDtoBuilder().WithId(requestedId).Build();
        _departmentServiceMock
            .Setup(s => s.DeleteAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(department);

        var command = new DeleteDepartmentCommand { Id = requestedId };
        await _sut.Handle(command, CancellationToken.None);

        _departmentServiceMock.Verify(
            s => s.DeleteAsync(requestedId, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var department = new DepartmentDtoBuilder().Build();
        _departmentServiceMock
            .Setup(s => s.DeleteAsync(It.IsAny<int>(), token))
            .ReturnsAsync(department);

        var command = new DeleteDepartmentCommand { Id = 1 };
        await _sut.Handle(command, token);

        _departmentServiceMock.Verify(
            s => s.DeleteAsync(It.IsAny<int>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        const int departmentId = 5;
        _departmentServiceMock
            .Setup(s => s.DeleteAsync(departmentId, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Delete failed."));

        var command = new DeleteDepartmentCommand { Id = departmentId };
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Delete failed.");
    }
}
