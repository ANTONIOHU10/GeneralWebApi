using FluentValidation;
using GeneralWebApi.DTOs.Task;

namespace GeneralWebApi.Application.Features.Tasks.Validators;

/// <summary>
/// Validator for TaskSearchDto
/// </summary>
public class TaskSearchDtoValidator : AbstractValidator<TaskSearchDto>
{
    public TaskSearchDtoValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0).WithMessage("Page number must be greater than 0");

        RuleFor(x => x.PageSize)
            .GreaterThan(0).WithMessage("Page size must be greater than 0")
            .LessThanOrEqualTo(100).WithMessage("Page size cannot exceed 100");

        RuleFor(x => x.Status)
            .Must(BeValidStatus).WithMessage("Invalid status value")
            .When(x => !string.IsNullOrEmpty(x.Status));

        RuleFor(x => x.Priority)
            .Must(BeValidPriority).WithMessage("Invalid priority value")
            .When(x => !string.IsNullOrEmpty(x.Priority));

        RuleFor(x => x.SortBy)
            .Must(BeValidSortField).WithMessage("Invalid sort field")
            .When(x => !string.IsNullOrEmpty(x.SortBy));

        RuleFor(x => x.DueDateTo)
            .GreaterThanOrEqualTo(x => x.DueDateFrom).WithMessage("End date must be after or equal to start date")
            .When(x => x.DueDateFrom.HasValue && x.DueDateTo.HasValue);
    }

    private static bool BeValidStatus(string? status)
    {
        if (string.IsNullOrEmpty(status)) return true;
        var validStatuses = new[] { "Pending", "InProgress", "Completed", "Cancelled" };
        return validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase);
    }

    private static bool BeValidPriority(string? priority)
    {
        if (string.IsNullOrEmpty(priority)) return true;
        var validPriorities = new[] { "Low", "Medium", "High", "Urgent" };
        return validPriorities.Contains(priority, StringComparer.OrdinalIgnoreCase);
    }

    private static bool BeValidSortField(string? sortBy)
    {
        if (string.IsNullOrEmpty(sortBy)) return true;
        var validFields = new[] { "Title", "Status", "Priority", "DueDate", "CreatedAt", "CompletedAt" };
        return validFields.Contains(sortBy, StringComparer.OrdinalIgnoreCase);
    }
}

