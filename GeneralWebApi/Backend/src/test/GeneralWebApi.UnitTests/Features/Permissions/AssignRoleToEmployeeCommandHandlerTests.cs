using AutoMapper;
using FluentAssertions;
using GeneralWebApi.Application.Features.Permissions.Roles.Commands;
using GeneralWebApi.Application.Features.Permissions.Roles.Handlers;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Integration.Repository.AnagraphyRepository;
using GeneralWebApi.Integration.Repository.Interfaces;
using Moq;

namespace GeneralWebApi.UnitTests.Features.Permissions;

public sealed class AssignRoleToEmployeeCommandHandlerTests
{
    private readonly Mock<IEmployeeRoleRepository> _employeeRoleRepositoryMock;
    private readonly Mock<IEmployeeRepository> _employeeRepositoryMock;
    private readonly Mock<IRoleRepository> _roleRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly AssignRoleToEmployeeCommandHandler _sut;

    public AssignRoleToEmployeeCommandHandlerTests()
    {
        _employeeRoleRepositoryMock = new Mock<IEmployeeRoleRepository>(MockBehavior.Strict);
        _employeeRepositoryMock = new Mock<IEmployeeRepository>(MockBehavior.Strict);
        _roleRepositoryMock = new Mock<IRoleRepository>(MockBehavior.Strict);
        _mapperMock = new Mock<IMapper>(MockBehavior.Strict);

        _sut = new AssignRoleToEmployeeCommandHandler(
            _employeeRoleRepositoryMock.Object,
            _employeeRepositoryMock.Object,
            _roleRepositoryMock.Object,
            _mapperMock.Object);
    }

    [Fact]
    public async Task Handle_AssignsRole_WhenEmployeeAndRoleExist_AndNotAlreadyAssigned()
    {
        // Arrange
        var dto = new AssignRoleToEmployeeDto
        {
            EmployeeId = 1,
            RoleId = 2,
            ExpiryDate = DateTime.UtcNow.AddDays(30)
        };

        var command = new AssignRoleToEmployeeCommand { AssignRoleToEmployeeDto = dto };

        var employee = new GeneralWebApi.Domain.Entities.Anagraphy.Employee
        {
            Id = 1,
            FirstName = "John",
            LastName = "Doe"
        };

        var role = new GeneralWebApi.Domain.Entities.Permissions.Role
        {
            Id = 2,
            Name = "Manager"
        };

        var createdEmployeeRole = new GeneralWebApi.Domain.Entities.Permissions.EmployeeRole
        {
            Id = 10,
            EmployeeId = 1,
            RoleId = 2
        };

        var employeeRoleWithDetails = new GeneralWebApi.Domain.Entities.Permissions.EmployeeRole
        {
            Id = 10,
            EmployeeId = 1,
            RoleId = 2
        };

        var expectedDto = new EmployeeRoleDto
        {
            Id = 10,
            EmployeeId = 1,
            RoleId = 2
        };

        _employeeRepositoryMock
            .Setup(r => r.GetByIdAsync(dto.EmployeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(dto.RoleId))
            .ReturnsAsync(role);

        _employeeRoleRepositoryMock
            .Setup(r => r.ExistsByEmployeeAndRoleAsync(dto.EmployeeId, dto.RoleId))
            .ReturnsAsync(false);

        _employeeRoleRepositoryMock
            .Setup(r => r.CreateAsync(It.IsAny<GeneralWebApi.Domain.Entities.Permissions.EmployeeRole>()))
            .ReturnsAsync(createdEmployeeRole);

        _employeeRoleRepositoryMock
            .Setup(r => r.GetByIdAsync(createdEmployeeRole.Id))
            .ReturnsAsync(employeeRoleWithDetails);

        _mapperMock
            .Setup(m => m.Map<EmployeeRoleDto>(employeeRoleWithDetails))
            .Returns(expectedDto);

        // Act
        var result = await _sut.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(10);
        result.EmployeeId.Should().Be(1);
        result.RoleId.Should().Be(2);
    }

    [Fact]
    public async Task Handle_Throws_WhenEmployeeDoesNotExist()
    {
        // Arrange
        var dto = new AssignRoleToEmployeeDto
        {
            EmployeeId = 1,
            RoleId = 2
        };

        var command = new AssignRoleToEmployeeCommand { AssignRoleToEmployeeDto = dto };

        _employeeRepositoryMock
            .Setup(r => r.GetByIdAsync(dto.EmployeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((GeneralWebApi.Domain.Entities.Anagraphy.Employee?)null);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"Employee with ID {dto.EmployeeId} not found.");
    }

    [Fact]
    public async Task Handle_Throws_WhenRoleDoesNotExist()
    {
        // Arrange
        var dto = new AssignRoleToEmployeeDto
        {
            EmployeeId = 1,
            RoleId = 2
        };

        var command = new AssignRoleToEmployeeCommand { AssignRoleToEmployeeDto = dto };

        var employee = new GeneralWebApi.Domain.Entities.Anagraphy.Employee
        {
            Id = 1,
            FirstName = "John",
            LastName = "Doe"
        };

        _employeeRepositoryMock
            .Setup(r => r.GetByIdAsync(dto.EmployeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(dto.RoleId))
            .ReturnsAsync((GeneralWebApi.Domain.Entities.Permissions.Role?)null);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"Role with ID {dto.RoleId} not found.");
    }

    [Fact]
    public async Task Handle_Throws_WhenRoleAlreadyAssigned()
    {
        // Arrange
        var dto = new AssignRoleToEmployeeDto
        {
            EmployeeId = 1,
            RoleId = 2
        };

        var command = new AssignRoleToEmployeeCommand { AssignRoleToEmployeeDto = dto };

        var employee = new GeneralWebApi.Domain.Entities.Anagraphy.Employee
        {
            Id = 1,
            FirstName = "John",
            LastName = "Doe"
        };

        var role = new GeneralWebApi.Domain.Entities.Permissions.Role
        {
            Id = 2,
            Name = "Manager"
        };

        _employeeRepositoryMock
            .Setup(r => r.GetByIdAsync(dto.EmployeeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(employee);

        _roleRepositoryMock
            .Setup(r => r.GetByIdAsync(dto.RoleId))
            .ReturnsAsync(role);

        _employeeRoleRepositoryMock
            .Setup(r => r.ExistsByEmployeeAndRoleAsync(dto.EmployeeId, dto.RoleId))
            .ReturnsAsync(true);

        // Act
        Func<Task> act = () => _sut.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage($"Role '{role.Name}' is already assigned to employee '{employee.FirstName} {employee.LastName}'.");
    }
}

