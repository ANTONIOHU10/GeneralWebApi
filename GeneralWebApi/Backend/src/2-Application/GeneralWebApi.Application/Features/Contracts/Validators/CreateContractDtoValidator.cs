using FluentValidation;
using GeneralWebApi.DTOs.Contract;

namespace GeneralWebApi.Application.Features.Contracts.Validators;

public class CreateContractDtoValidator : AbstractValidator<CreateContractDto>
{
    public CreateContractDtoValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Employee ID is required");

        RuleFor(x => x.ContractType)
            .NotEmpty().WithMessage("Contract type is required")
            .MaximumLength(50).WithMessage("Contract type cannot exceed 50 characters");

        RuleFor(x => x.StartDate)
            .NotEmpty().WithMessage("Start date is required")
            .LessThanOrEqualTo(DateTime.Today).WithMessage("Start date cannot be in the future");

        RuleFor(x => x.EndDate)
            .GreaterThan(x => x.StartDate).WithMessage("End date must be after start date")
            .When(x => x.EndDate.HasValue);

        RuleFor(x => x.Status)
            .NotEmpty().WithMessage("Status is required")
            .MaximumLength(20).WithMessage("Status cannot exceed 20 characters")
            .Must(BeValidStatus).WithMessage("Invalid status value");

        RuleFor(x => x.Salary)
            .GreaterThanOrEqualTo(0).WithMessage("Salary cannot be negative")
            .When(x => x.Salary.HasValue);

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes cannot exceed 1000 characters");

        RuleFor(x => x.RenewalReminderDate)
            .GreaterThan(x => x.StartDate).WithMessage("Renewal reminder date must be after start date")
            .When(x => x.RenewalReminderDate.HasValue);
    }

    private static bool BeValidStatus(string status)
    {
        var validStatuses = new[] { "Active", "Inactive", "Expired", "Terminated", "Pending" };
        return validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase);
    }
}

