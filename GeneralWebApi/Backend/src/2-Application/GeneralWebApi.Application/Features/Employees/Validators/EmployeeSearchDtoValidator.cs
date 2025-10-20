using FluentValidation;
using GeneralWebApi.DTOs.Employee;

namespace GeneralWebApi.Application.Features.Employees.Validators;

public class EmployeeSearchDtoValidator : AbstractValidator<EmployeeSearchDto>
{
    public EmployeeSearchDtoValidator()
    {
        RuleFor(x => x.SearchTerm)
            .MaximumLength(100).WithMessage("Search term cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.SearchTerm));

        RuleFor(x => x.DepartmentId)
            .GreaterThan(0).WithMessage("Department ID must be greater than 0")
            .When(x => x.DepartmentId.HasValue);

        RuleFor(x => x.PositionId)
            .GreaterThan(0).WithMessage("Position ID must be greater than 0")
            .When(x => x.PositionId.HasValue);

        RuleFor(x => x.EmploymentStatus)
            .MaximumLength(20).WithMessage("Employment status cannot exceed 20 characters")
            .When(x => !string.IsNullOrEmpty(x.EmploymentStatus));

        RuleFor(x => x.HireDateFrom)
            .LessThanOrEqualTo(DateTime.Today).WithMessage("Hire date from cannot be in the future")
            .When(x => x.HireDateFrom.HasValue);

        RuleFor(x => x.HireDateTo)
            .LessThanOrEqualTo(DateTime.Today).WithMessage("Hire date to cannot be in the future")
            .When(x => x.HireDateTo.HasValue);

        RuleFor(x => x.HireDateTo)
            .GreaterThanOrEqualTo(x => x.HireDateFrom).WithMessage("Hire date to must be after hire date from")
            .When(x => x.HireDateFrom.HasValue && x.HireDateTo.HasValue);

        RuleFor(x => x.PageNumber)
            .GreaterThan(0).WithMessage("Page number must be greater than 0");

        RuleFor(x => x.PageSize)
            .GreaterThan(0).WithMessage("Page size must be greater than 0")
            .LessThanOrEqualTo(100).WithMessage("Page size cannot exceed 100");

        RuleFor(x => x.SortBy)
            .Must(BeValidSortField).WithMessage("Invalid sort field")
            .When(x => !string.IsNullOrEmpty(x.SortBy));
    }

    private static bool BeValidSortField(string? sortBy)
    {
        if (string.IsNullOrEmpty(sortBy)) return true;

        var validFields = new[] { "firstname", "lastname", "employeenumber", "email", "hiredate", "employmentsstatus", "department", "position" };
        return validFields.Contains(sortBy.ToLower());
    }
}