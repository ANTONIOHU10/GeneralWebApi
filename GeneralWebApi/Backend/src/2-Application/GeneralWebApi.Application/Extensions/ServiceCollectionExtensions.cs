using FluentValidation;
using GeneralWebApi.Application.Features.Employees.Handlers;
using GeneralWebApi.Application.Features.Employees.Validators;
using GeneralWebApi.Application.Interfaces;
using GeneralWebApi.Application.Mappings;
using GeneralWebApi.Application.Services;
using GeneralWebApi.DTOs.Employee;
using Microsoft.Extensions.DependencyInjection;

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
        return services;
    }
}