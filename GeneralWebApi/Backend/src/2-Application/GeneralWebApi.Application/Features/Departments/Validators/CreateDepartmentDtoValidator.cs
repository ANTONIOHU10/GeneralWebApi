using FluentValidation;
using GeneralWebApi.DTOs.Department;

namespace GeneralWebApi.Application.Features.Departments.Validators;

public class CreateDepartmentDtoValidator : AbstractValidator<CreateDepartmentDto>
{
    public CreateDepartmentDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Department name is required")
            .MaximumLength(100).WithMessage("Department name cannot exceed 100 characters");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Department code is required")
            .MaximumLength(20).WithMessage("Department code cannot exceed 20 characters")
            .Matches("^[A-Z0-9_-]+$").WithMessage("Department code must contain only uppercase letters, numbers, hyphens, and underscores");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");

        RuleFor(x => x.Level)
            .GreaterThan(0).WithMessage("Level must be greater than 0");

        RuleFor(x => x.Path)
            .MaximumLength(500).WithMessage("Path cannot exceed 500 characters");
    }
}

