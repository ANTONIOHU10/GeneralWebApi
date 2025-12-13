using FluentValidation;
using GeneralWebApi.DTOs.Task;

namespace GeneralWebApi.Application.Features.Tasks.Validators;

/// <summary>
/// Validator for CreateTaskDto
/// </summary>
public class CreateTaskDtoValidator : AbstractValidator<CreateTaskDto>
{
    public CreateTaskDtoValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required")
            .MaximumLength(200).WithMessage("Title cannot exceed 200 characters");

        RuleFor(x => x.Description)
            .MaximumLength(2000).WithMessage("Description cannot exceed 2000 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required")
            .MaximumLength(20).WithMessage("Status cannot exceed 20 characters")
            .Must(BeValidStatus).WithMessage("Invalid status value");

        RuleFor(x => x.Priority)
            .NotEmpty().WithMessage("Priority is required")
            .MaximumLength(20).WithMessage("Priority cannot exceed 20 characters")
            .Must(BeValidPriority).WithMessage("Invalid priority value");

        RuleFor(x => x.Category)
            .MaximumLength(50).WithMessage("Category cannot exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Category));

        RuleFor(x => x.EstimatedHours)
            .GreaterThanOrEqualTo(0).WithMessage("Estimated hours cannot be negative")
            .When(x => x.EstimatedHours.HasValue);
    }

    private static bool BeValidStatus(string status)
    {
        var validStatuses = new[] { "Pending", "InProgress", "Completed", "Cancelled" };
        return validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase);
    }

    private static bool BeValidPriority(string priority)
    {
        var validPriorities = new[] { "Low", "Medium", "High", "Urgent" };
        return validPriorities.Contains(priority, StringComparer.OrdinalIgnoreCase);
    }
}

