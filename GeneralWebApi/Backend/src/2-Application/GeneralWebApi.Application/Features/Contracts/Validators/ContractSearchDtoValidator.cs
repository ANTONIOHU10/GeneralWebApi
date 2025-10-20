using FluentValidation;
using GeneralWebApi.DTOs.Contract;

namespace GeneralWebApi.Application.Features.Contracts.Validators;

public class ContractSearchDtoValidator : AbstractValidator<ContractSearchDto>
{
    public ContractSearchDtoValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0).WithMessage("Page number must be greater than 0");

        RuleFor(x => x.PageSize)
            .GreaterThan(0).WithMessage("Page size must be greater than 0")
            .LessThanOrEqualTo(100).WithMessage("Page size cannot exceed 100");

        RuleFor(x => x.SearchTerm)
            .MaximumLength(100).WithMessage("Search term cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.SearchTerm));

        RuleFor(x => x.ContractType)
            .MaximumLength(50).WithMessage("Contract type cannot exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.ContractType));

        RuleFor(x => x.Status)
            .MaximumLength(20).WithMessage("Status cannot exceed 20 characters")
            .Must(BeValidStatus).WithMessage("Invalid status value")
            .When(x => !string.IsNullOrEmpty(x.Status));

        RuleFor(x => x.SortBy)
            .Must(BeValidSortField).WithMessage("Invalid sort field")
            .When(x => !string.IsNullOrEmpty(x.SortBy));
    }

    private static bool BeValidStatus(string? status)
    {
        if (string.IsNullOrEmpty(status))
            return true;

        var validStatuses = new[] { "Active", "Inactive", "Expired", "Terminated", "Pending" };
        return validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase);
    }

    private static bool BeValidSortField(string? sortBy)
    {
        if (string.IsNullOrEmpty(sortBy))
            return true;

        var validFields = new[] { "ContractType", "StartDate", "EndDate", "Status", "CreatedAt" };
        return validFields.Contains(sortBy, StringComparer.OrdinalIgnoreCase);
    }
}





