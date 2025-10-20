using FluentValidation;
using GeneralWebApi.DTOs.Position;

namespace GeneralWebApi.Application.Features.Positions.Validators;

public class PositionSearchDtoValidator : AbstractValidator<PositionSearchDto>
{
    public PositionSearchDtoValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0).WithMessage("Page number must be greater than 0");

        RuleFor(x => x.PageSize)
            .GreaterThan(0).WithMessage("Page size must be greater than 0")
            .LessThanOrEqualTo(100).WithMessage("Page size cannot exceed 100");

        RuleFor(x => x.SearchTerm)
            .MaximumLength(100).WithMessage("Search term cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.SearchTerm));

        RuleFor(x => x.Level)
            .GreaterThan(0).WithMessage("Level must be greater than 0")
            .When(x => x.Level.HasValue);

        RuleFor(x => x.SortBy)
            .Must(BeValidSortField).WithMessage("Invalid sort field")
            .When(x => !string.IsNullOrEmpty(x.SortBy));
    }

    private static bool BeValidSortField(string? sortBy)
    {
        if (string.IsNullOrEmpty(sortBy))
            return true;

        var validFields = new[] { "Title", "Code", "Level", "MinSalary", "MaxSalary", "CreatedAt" };
        return validFields.Contains(sortBy, StringComparer.OrdinalIgnoreCase);
    }
}





