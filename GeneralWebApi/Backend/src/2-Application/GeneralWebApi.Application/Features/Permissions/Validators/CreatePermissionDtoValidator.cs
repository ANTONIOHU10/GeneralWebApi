using FluentValidation;
using GeneralWebApi.DTOs.Permissions;

namespace GeneralWebApi.Application.Features.Permissions.Validators;

/// <summary>
/// Create permission DTO validator
/// </summary>
public class CreatePermissionDtoValidator : AbstractValidator<CreatePermissionDto>
{
    public CreatePermissionDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Permission name is required")
            .Length(2, 100).WithMessage("Permission name must be between 2 and 100 characters")
            .Matches("^[a-zA-Z0-9\\s_.-]+$").WithMessage("Permission name can only contain letters, numbers, spaces, dots, hyphens, and underscores");

        RuleFor(x => x.Description)
            .MaximumLength(200).WithMessage("Description cannot exceed 200 characters");

        RuleFor(x => x.Resource)
            .NotEmpty().WithMessage("Resource is required")
            .Length(2, 50).WithMessage("Resource must be between 2 and 50 characters")
            .Matches("^[a-zA-Z0-9\\s_.-]+$").WithMessage("Resource can only contain letters, numbers, spaces, dots, hyphens, and underscores");

        RuleFor(x => x.Action)
            .NotEmpty().WithMessage("Action is required")
            .Length(2, 50).WithMessage("Action must be between 2 and 50 characters")
            .Matches("^[a-zA-Z0-9\\s_.-]+$").WithMessage("Action can only contain letters, numbers, spaces, dots, hyphens, and underscores");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required")
            .Length(2, 50).WithMessage("Category must be between 2 and 50 characters")
            .Matches("^[a-zA-Z0-9\\s_.-]+$").WithMessage("Category can only contain letters, numbers, spaces, dots, hyphens, and underscores");
    }
}
