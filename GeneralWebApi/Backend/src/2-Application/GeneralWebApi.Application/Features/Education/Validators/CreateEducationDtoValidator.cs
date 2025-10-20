using FluentValidation;
using GeneralWebApi.DTOs.Education;

namespace GeneralWebApi.Application.Features.Education.Validators;

public class CreateEducationDtoValidator : AbstractValidator<CreateEducationDto>
{
    public CreateEducationDtoValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0)
            .WithMessage("Employee ID must be greater than 0");

        RuleFor(x => x.Institution)
            .NotEmpty()
            .WithMessage("Institution is required")
            .MaximumLength(200)
            .WithMessage("Institution cannot exceed 200 characters");

        RuleFor(x => x.Degree)
            .NotEmpty()
            .WithMessage("Degree is required")
            .MaximumLength(100)
            .WithMessage("Degree cannot exceed 100 characters");

        RuleFor(x => x.FieldOfStudy)
            .NotEmpty()
            .WithMessage("Field of study is required")
            .MaximumLength(100)
            .WithMessage("Field of study cannot exceed 100 characters");

        RuleFor(x => x.StartDate)
            .NotEmpty()
            .WithMessage("Start date is required")
            .LessThanOrEqualTo(DateTime.Today)
            .WithMessage("Start date cannot be in the future");

        RuleFor(x => x.EndDate)
            .GreaterThan(x => x.StartDate)
            .When(x => x.EndDate.HasValue)
            .WithMessage("End date must be after start date");

        RuleFor(x => x.Grade)
            .MaximumLength(50)
            .WithMessage("Grade cannot exceed 50 characters");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters");
    }
}