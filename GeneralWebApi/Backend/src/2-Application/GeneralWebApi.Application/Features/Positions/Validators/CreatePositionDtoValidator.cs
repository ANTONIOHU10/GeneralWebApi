using FluentValidation;
using GeneralWebApi.DTOs.Position;

namespace GeneralWebApi.Application.Features.Positions.Validators;

public class CreatePositionDtoValidator : AbstractValidator<CreatePositionDto>
{
    public CreatePositionDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Position title is required")
            .MaximumLength(100).WithMessage("Position title cannot exceed 100 characters");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Position code is required")
            .MaximumLength(20).WithMessage("Position code cannot exceed 20 characters")
            .Matches("^[A-Z0-9_-]+$").WithMessage("Position code must contain only uppercase letters, numbers, hyphens, and underscores");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters");

        RuleFor(x => x.DepartmentId)
            .GreaterThan(0).WithMessage("Department ID is required");

        RuleFor(x => x.Level)
            .GreaterThan(0).WithMessage("Level must be greater than 0");

        RuleFor(x => x.MinSalary)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum salary cannot be negative")
            .When(x => x.MinSalary.HasValue);

        RuleFor(x => x.MaxSalary)
            .GreaterThanOrEqualTo(0).WithMessage("Maximum salary cannot be negative")
            .When(x => x.MaxSalary.HasValue);

        RuleFor(x => x.MaxSalary)
            .GreaterThan(x => x.MinSalary).WithMessage("Maximum salary must be greater than minimum salary")
            .When(x => x.MinSalary.HasValue && x.MaxSalary.HasValue);
    }
}

