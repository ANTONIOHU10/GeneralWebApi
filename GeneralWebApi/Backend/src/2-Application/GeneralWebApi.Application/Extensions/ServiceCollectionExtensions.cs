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
        // CSV export
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(ExportMappingProfile).Assembly));
        services.AddScoped<ICSVExportService, CSVExportService>();

        // Employees
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(EmployeeMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateEmployeeCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DeleteEmployeeCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetEmployeeByIdQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetEmployeesByDepartmentQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetEmployeesQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(UpdateEmployeeCommandHandler).Assembly));
        services.AddScoped<IValidator<CreateEmployeeDto>, CreateEmployeeDtoValidator>();
        services.AddScoped<IValidator<UpdateEmployeeDto>, UpdateEmployeeDtoValidator>();
        services.AddScoped<IValidator<EmployeeSearchDto>, EmployeeSearchDtoValidator>();
        services.AddScoped<IValidator<int>, EmployeeIdValidator>();
        services.AddScoped<IEmployeeService, EmployeeService>();

        // Education
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(EducationMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateEducationCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(UpdateEducationCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DeleteEducationCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetEducationByIdQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetEducationsQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetEducationsByEmployeeIdQueryHandler).Assembly));
        services.AddScoped<IValidator<CreateEducationDto>, CreateEducationDtoValidator>();
        services.AddScoped<IValidator<UpdateEducationDto>, UpdateEducationDtoValidator>();
        services.AddScoped<IEducationService, EducationService>();

        // IdentityDocument
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(IdentityDocumentMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateIdentityDocumentCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(UpdateIdentityDocumentCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DeleteIdentityDocumentCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetIdentityDocumentByIdQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetIdentityDocumentsQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetIdentityDocumentsByEmployeeIdQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetExpiringIdentityDocumentsQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetExpiredIdentityDocumentsQueryHandler).Assembly));
        services.AddScoped<IValidator<CreateIdentityDocumentDto>, CreateIdentityDocumentDtoValidator>();
        services.AddScoped<IValidator<UpdateIdentityDocumentDto>, UpdateIdentityDocumentDtoValidator>();
        services.AddScoped<IIdentityDocumentService, IdentityDocumentService>();

        // Department
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(DepartmentMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateDepartmentCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(UpdateDepartmentCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DeleteDepartmentCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetDepartmentByIdQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetDepartmentsQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetDepartmentHierarchyQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetDepartmentsByParentQueryHandler).Assembly));
        services.AddScoped<IValidator<CreateDepartmentDto>, CreateDepartmentDtoValidator>();
        services.AddScoped<IValidator<UpdateDepartmentDto>, UpdateDepartmentDtoValidator>();
        services.AddScoped<IValidator<DepartmentSearchDto>, DepartmentSearchDtoValidator>();
        services.AddScoped<IValidator<int>, DepartmentIdValidator>();
        services.AddScoped<IDepartmentService, DepartmentService>();

        // Position
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(PositionMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreatePositionCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(UpdatePositionCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DeletePositionCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetPositionByIdQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetPositionsQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetPositionsByDepartmentQueryHandler).Assembly));
        services.AddScoped<IValidator<CreatePositionDto>, CreatePositionDtoValidator>();
        services.AddScoped<IValidator<UpdatePositionDto>, UpdatePositionDtoValidator>();
        services.AddScoped<IValidator<PositionSearchDto>, PositionSearchDtoValidator>();
        services.AddScoped<IValidator<int>, PositionIdValidator>();
        services.AddScoped<IPositionService, PositionService>();

        // Certification
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(CertificationMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateCertificationCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(UpdateCertificationCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DeleteCertificationCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetCertificationByIdQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetCertificationsQueryHandler).Assembly));
        services.AddScoped<IValidator<CreateCertificationDto>, CreateCertificationDtoValidator>();
        services.AddScoped<IValidator<UpdateCertificationDto>, UpdateCertificationDtoValidator>();
        services.AddScoped<ICertificationService, CertificationService>();

        // Contract
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(ContractMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateContractCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(UpdateContractCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DeleteContractCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetContractByIdQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetContractsQueryHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetContractsByStatusQueryHandler).Assembly));
        services.AddScoped<IValidator<CreateContractDto>, CreateContractDtoValidator>();
        services.AddScoped<IValidator<UpdateContractDto>, UpdateContractDtoValidator>();
        services.AddScoped<IContractService, ContractService>();

        // Contract Approvals
        services.AddScoped<IContractApprovalService, ContractApprovalService>();

        // Enum Values Service
        services.AddScoped<IEnumValueService, EnumValueService>();

        // Permission Services
        services.AddAutoMapper(cfg => cfg.AddMaps(typeof(PermissionMappingProfile).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateRoleCommandHandler).Assembly));
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreatePermissionCommandHandler).Assembly));

        // Permission Validators
        services.AddScoped<IValidator<CreateRoleDto>, CreateRoleDtoValidator>();
        services.AddScoped<IValidator<UpdateRoleDto>, UpdateRoleDtoValidator>();
        services.AddScoped<IValidator<CreatePermissionDto>, CreatePermissionDtoValidator>();
        services.AddScoped<IValidator<UpdatePermissionDto>, UpdatePermissionDtoValidator>();
        services.AddScoped<IValidator<AssignRoleToEmployeeDto>, AssignRoleToEmployeeDtoValidator>();

        return services;
    }
}