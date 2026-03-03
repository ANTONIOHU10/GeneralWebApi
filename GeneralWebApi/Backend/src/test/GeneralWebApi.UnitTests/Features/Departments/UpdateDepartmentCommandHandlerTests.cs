using FluentAssertions;
using GeneralWebApi.Application.Features.Departments.Commands;
using GeneralWebApi.Application.Features.Departments.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Department;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Departments;

/// <summary>
/// Unit tests for <see cref="UpdateDepartmentCommandHandler"/>.
/// Same enterprise-style pattern: single SUT, mocked IDepartmentService.
/// </summary>
public sealed class UpdateDepartmentCommandHandlerTests
{
    private readonly Mock<IDepartmentService> _departmentServiceMock;
    private readonly UpdateDepartmentCommandHandler _sut;

    public UpdateDepartmentCommandHandlerTests()
    {
        _departmentServiceMock = new Mock<IDepartmentService>();
        _sut = new UpdateDepartmentCommandHandler(_departmentServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsDepartmentDto_WhenUpdateSucceeds()
    {
        const int departmentId = 50;
        var updateDto = new UpdateDepartmentDtoBuilder()
            .WithId(departmentId)
            .WithName("Engineering Updated")
            .WithCode("ENG2")
            .Build();
        var expected = new DepartmentDtoBuilder()
            .WithId(departmentId)
            .WithName("Engineering Updated")
            .WithCode("ENG2")
            .Build();

        _departmentServiceMock
            .Setup(s => s.UpdateAsync(departmentId, updateDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var command = new UpdateDepartmentCommand { UpdateDepartmentDto = updateDto };

        var result = await _sut.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().BeSameAs(expected);
        result.Id.Should().Be(departmentId);
        result.Name.Should().Be("Engineering Updated");
    }

    [Fact]
    public async Task Handle_CallsDepartmentServiceWithIdAndUpdateDto_WhenInvoked()
    {
        const int departmentId = 99;
        var updateDto = new UpdateDepartmentDtoBuilder().WithId(departmentId).WithName("HR").Build();
        var department = new DepartmentDtoBuilder().WithId(departmentId).Build();
        _departmentServiceMock
            .Setup(s => s.UpdateAsync(It.IsAny<int>(), It.IsAny<UpdateDepartmentDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(department);

        var command = new UpdateDepartmentCommand { UpdateDepartmentDto = updateDto };
        await _sut.Handle(command, CancellationToken.None);

        _departmentServiceMock.Verify(
            s => s.UpdateAsync(
                departmentId,
                It.Is<UpdateDepartmentDto>(dto => ReferenceEquals(dto, updateDto)),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var updateDto = new UpdateDepartmentDtoBuilder().WithId(1).Build();
        var department = new DepartmentDtoBuilder().Build();
        _departmentServiceMock
            .Setup(s => s.UpdateAsync(1, It.IsAny<UpdateDepartmentDto>(), token))
            .ReturnsAsync(department);

        var command = new UpdateDepartmentCommand { UpdateDepartmentDto = updateDto };
        await _sut.Handle(command, token);

        _departmentServiceMock.Verify(
            s => s.UpdateAsync(It.IsAny<int>(), It.IsAny<UpdateDepartmentDto>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        const int departmentId = 5;
        var updateDto = new UpdateDepartmentDtoBuilder().WithId(departmentId).Build();
        var command = new UpdateDepartmentCommand { UpdateDepartmentDto = updateDto };
        _departmentServiceMock
            .Setup(s => s.UpdateAsync(departmentId, updateDto, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Update failed."));

        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Update failed.");
    }
}
