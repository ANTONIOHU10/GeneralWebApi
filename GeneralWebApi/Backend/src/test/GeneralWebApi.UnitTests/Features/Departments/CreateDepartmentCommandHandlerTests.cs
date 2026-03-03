using FluentAssertions;
using GeneralWebApi.Application.Features.Departments.Commands;
using GeneralWebApi.Application.Features.Departments.Handlers;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Department;
using GeneralWebApi.UnitTests.Builders;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Departments;

/// <summary>
/// Unit tests for <see cref="CreateDepartmentCommandHandler"/>.
/// Same enterprise-style pattern: single SUT, mocked IDepartmentService.
/// </summary>
public sealed class CreateDepartmentCommandHandlerTests
{
    private readonly Mock<IDepartmentService> _departmentServiceMock;
    private readonly CreateDepartmentCommandHandler _sut;

    public CreateDepartmentCommandHandlerTests()
    {
        _departmentServiceMock = new Mock<IDepartmentService>();
        _sut = new CreateDepartmentCommandHandler(_departmentServiceMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsDepartmentDto_WhenCreationSucceeds()
    {
        var createDto = new CreateDepartmentDtoBuilder()
            .WithName("Sales")
            .WithCode("SAL")
            .Build();
        var expected = new DepartmentDtoBuilder()
            .WithId(100)
            .WithName("Sales")
            .WithCode("SAL")
            .Build();

        _departmentServiceMock
            .Setup(s => s.CreateAsync(createDto, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expected);

        var command = new CreateDepartmentCommand { CreateDepartmentDto = createDto };

        var result = await _sut.Handle(command, CancellationToken.None);

        result.Should().NotBeNull();
        result.Should().BeSameAs(expected);
        result.Id.Should().Be(100);
        result.Name.Should().Be("Sales");
        result.Code.Should().Be("SAL");
    }

    [Fact]
    public async Task Handle_CallsDepartmentServiceWithCommandDto_WhenInvoked()
    {
        var createDto = new CreateDepartmentDtoBuilder().WithName("HR").WithCode("HR").Build();
        var department = new DepartmentDtoBuilder().WithId(1).Build();
        _departmentServiceMock
            .Setup(s => s.CreateAsync(It.IsAny<CreateDepartmentDto>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(department);

        var command = new CreateDepartmentCommand { CreateDepartmentDto = createDto };
        await _sut.Handle(command, CancellationToken.None);

        _departmentServiceMock.Verify(
            s => s.CreateAsync(
                It.Is<CreateDepartmentDto>(dto => ReferenceEquals(dto, createDto)),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ForwardsCancellationToken_WhenInvoked()
    {
        var cts = new CancellationTokenSource();
        var token = cts.Token;
        var createDto = new CreateDepartmentDtoBuilder().Build();
        var department = new DepartmentDtoBuilder().Build();
        _departmentServiceMock
            .Setup(s => s.CreateAsync(It.IsAny<CreateDepartmentDto>(), token))
            .ReturnsAsync(department);

        var command = new CreateDepartmentCommand { CreateDepartmentDto = createDto };
        await _sut.Handle(command, token);

        _departmentServiceMock.Verify(
            s => s.CreateAsync(It.IsAny<CreateDepartmentDto>(), token),
            Times.Once);
    }

    [Fact]
    public async Task Handle_PropagatesException_WhenServiceThrows()
    {
        var createDto = new CreateDepartmentDtoBuilder().Build();
        var command = new CreateDepartmentCommand { CreateDepartmentDto = createDto };
        _departmentServiceMock
            .Setup(s => s.CreateAsync(createDto, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Create failed."));

        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Create failed.");
    }
}
