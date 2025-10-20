using FluentValidation;
using GeneralWebApi.DTOs.Permissions;

namespace GeneralWebApi.Application.Features.Permissions.Validators;

/// <summary>
/// Assign role to employee DTO validator
/// </summary>
public class AssignRoleToEmployeeDtoValidator : AbstractValidator<AssignRoleToEmployeeDto>
{
    public AssignRoleToEmployeeDtoValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Employee ID must be greater than 0");

        RuleFor(x => x.RoleId)
            .GreaterThan(0).WithMessage("Role ID must be greater than 0");

        RuleFor(x => x.ExpiryDate)
            .GreaterThan(DateTime.UtcNow).WithMessage("Expiry date must be in the future")
            .When(x => x.ExpiryDate.HasValue);
    }
}
