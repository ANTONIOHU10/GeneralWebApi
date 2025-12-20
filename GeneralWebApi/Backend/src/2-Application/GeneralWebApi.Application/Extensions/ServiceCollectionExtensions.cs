using FluentValidation;
using GeneralWebApi.Application.Features.Employees.Handlers;
using GeneralWebApi.Application.Features.Employees.Validators;
using GeneralWebApi.Application.Features.Education.Handlers;
using GeneralWebApi.Application.Features.Education.Validators;
using GeneralWebApi.Application.Features.IdentityDocument.Handlers;
using GeneralWebApi.Application.Features.IdentityDocument.Validators;
using GeneralWebApi.Application.Features.Departments.Handlers;
using GeneralWebApi.Application.Features.Departments.Validators;
using GeneralWebApi.Application.Features.Positions.Handlers;
using GeneralWebApi.Application.Features.Positions.Validators;
using GeneralWebApi.Application.Features.Certifications.Handlers;
using GeneralWebApi.Application.Features.Certifications.Validators;
using GeneralWebApi.Application.Features.Contracts.Handlers;
using GeneralWebApi.Application.Features.Contracts.Validators;
using GeneralWebApi.Application.Features.Tasks.Handlers;
using GeneralWebApi.Application.Features.Tasks.Validators;
using GeneralWebApi.Application.Features.Notifications.Handlers;
using GeneralWebApi.Application.Features.Users.Handlers;
using GeneralWebApi.Application.Features.Users.Validators;
using GeneralWebApi.DTOs.Users;
using GeneralWebApi.Application.Mappings;
using GeneralWebApi.Application.Services;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.DTOs.Employee;
using GeneralWebApi.DTOs.Education;
using GeneralWebApi.DTOs.IdentityDocument;
using GeneralWebApi.DTOs.Department;
using GeneralWebApi.DTOs.Position;
using GeneralWebApi.DTOs.Certification;
using GeneralWebApi.DTOs.Contract;
using GeneralWebApi.DTOs.Task;
using Microsoft.Extensions.DependencyInjection;
using GeneralWebApi.DTOs.Permissions;
using GeneralWebApi.Application.Features.Permissions.Validators;
using GeneralWebApi.Application.Features.Permissions.Roles.Handlers;
using GeneralWebApi.Application.Features.Permissions.Permissions.Handlers;
using GeneralWebApi.Application.Services.Contracts.Approvals;

namespace GeneralWebApi.Application.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddCSVExport(this IServiceCollection services)
    {

        // no need to register the mediateR handlers manually, just the the assembly that contains the handlers
        // because all the handlers belong to the same assembly ( same project )
        // but to hold a cleaner structure, we can it as a separate extension methods

        // CSV export
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(ExportMappingProfile).Assembly));
        services.AddScoped<ICSVExportService, CSVExportService>();

        // Employees
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(EmployeeMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateEmployeeCommandHandler).Assembly));
        services.AddScoped<IValidator<CreateEmployeeDto>, CreateEmployeeDtoValidator>();
        services.AddScoped<IValidator<UpdateEmployeeDto>, UpdateEmployeeDtoValidator>();
        services.AddScoped<IValidator<EmployeeSearchDto>, EmployeeSearchDtoValidator>();
        services.AddScoped<IValidator<int>, EmployeeIdValidator>();
        services.AddScoped<IEmployeeService, EmployeeService>();

        // Education
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(EducationMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateEducationCommandHandler).Assembly));
        services.AddScoped<IValidator<CreateEducationDto>, CreateEducationDtoValidator>();
        services.AddScoped<IValidator<UpdateEducationDto>, UpdateEducationDtoValidator>();
        services.AddScoped<IEducationService, EducationService>();

        // IdentityDocument
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(IdentityDocumentMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateIdentityDocumentCommandHandler).Assembly));
        services.AddScoped<IValidator<CreateIdentityDocumentDto>, CreateIdentityDocumentDtoValidator>();
        services.AddScoped<IValidator<UpdateIdentityDocumentDto>, UpdateIdentityDocumentDtoValidator>();
        services.AddScoped<IIdentityDocumentService, IdentityDocumentService>();

        // Department
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(DepartmentMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateDepartmentCommandHandler).Assembly));
        services.AddScoped<IValidator<CreateDepartmentDto>, CreateDepartmentDtoValidator>();
        services.AddScoped<IValidator<UpdateDepartmentDto>, UpdateDepartmentDtoValidator>();
        services.AddScoped<IValidator<DepartmentSearchDto>, DepartmentSearchDtoValidator>();
        services.AddScoped<IValidator<int>, DepartmentIdValidator>();
        services.AddScoped<IDepartmentService, DepartmentService>();

        // Position
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(PositionMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreatePositionCommandHandler).Assembly));
        services.AddScoped<IValidator<CreatePositionDto>, CreatePositionDtoValidator>();
        services.AddScoped<IValidator<UpdatePositionDto>, UpdatePositionDtoValidator>();
        services.AddScoped<IValidator<PositionSearchDto>, PositionSearchDtoValidator>();
        services.AddScoped<IValidator<int>, PositionIdValidator>();
        services.AddScoped<IPositionService, PositionService>();

        // Certification
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(CertificationMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateCertificationCommandHandler).Assembly));
        services.AddScoped<IValidator<CreateCertificationDto>, CreateCertificationDtoValidator>();
        services.AddScoped<IValidator<UpdateCertificationDto>, UpdateCertificationDtoValidator>();
        services.AddScoped<ICertificationService, CertificationService>();

        // Contract
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(ContractMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateContractCommandHandler).Assembly));
        services.AddScoped<IValidator<CreateContractDto>, CreateContractDtoValidator>();
        services.AddScoped<IValidator<UpdateContractDto>, UpdateContractDtoValidator>();
        services.AddScoped<IContractService, ContractService>();

        // Contract Approvals
        services.AddScoped<IContractApprovalService, ContractApprovalService>();

        // Enum Values Service
        services.AddScoped<IEnumValueService, EnumValueService>();

        // Audit Service
        services.AddScoped<IAuditService, AuditService>();

        // Tasks
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(TaskMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateTaskCommandHandler).Assembly));
        services.AddScoped<IValidator<CreateTaskDto>, CreateTaskDtoValidator>();
        services.AddScoped<IValidator<UpdateTaskDto>, UpdateTaskDtoValidator>();
        services.AddScoped<IValidator<TaskSearchDto>, TaskSearchDtoValidator>();
        services.AddScoped<ITaskService, TaskService>();

        // Users
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetUsersWithEmployeeQueryHandler).Assembly));
        services.AddScoped<IValidator<CreateUserRequest>, CreateUserRequestValidator>();
        services.AddScoped<IValidator<UpdateUserRequest>, UpdateUserRequestValidator>();
        services.AddScoped<IUserService, UserService>();

        // Permission Services
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(PermissionMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateRoleCommandHandler).Assembly));

        // Permission Validators
        services.AddScoped<IValidator<CreateRoleDto>, CreateRoleDtoValidator>();
        services.AddScoped<IValidator<UpdateRoleDto>, UpdateRoleDtoValidator>();
        services.AddScoped<IValidator<CreatePermissionDto>, CreatePermissionDtoValidator>();
        services.AddScoped<IValidator<UpdatePermissionDto>, UpdatePermissionDtoValidator>();
        services.AddScoped<IValidator<AssignRoleToEmployeeDto>, AssignRoleToEmployeeDtoValidator>();

        // Notifications
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(NotificationMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateNotificationCommandHandler).Assembly));
        services.AddScoped<INotificationService, NotificationService>();

        return services;
    }
}