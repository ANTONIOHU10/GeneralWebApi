using FluentValidation;
using GeneralWebApi.DTOs.Permissions;

namespace GeneralWebApi.Application.Features.Permissions.Validators;

/// <summary>
/// Update role DTO validator
/// </summary>
public class UpdateRoleDtoValidator : AbstractValidator<UpdateRoleDto>
{
    public UpdateRoleDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Role name is required")
            .Length(2, 50).WithMessage("Role name must be between 2 and 50 characters")
            .Matches("^[a-zA-Z0-9\\s_-]+$").WithMessage("Role name can only contain letters, numbers, spaces, hyphens, and underscores");

        RuleFor(x => x.Description)
            .MaximumLength(200).WithMessage("Description cannot exceed 200 characters");

        RuleFor(x => x.PermissionIds)
            .NotNull().WithMessage("Permission IDs cannot be null");
    }
}
