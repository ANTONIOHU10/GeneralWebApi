using FluentValidation;
using GeneralWebApi.DTOs.Employee;

namespace GeneralWebApi.Application.Features.Employees.Validators;

public class UpdateEmployeeDtoValidator : AbstractValidator<UpdateEmployeeDto>
{
    public UpdateEmployeeDtoValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Employee ID is required");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(50).WithMessage("First name cannot exceed 50 characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(50).WithMessage("Last name cannot exceed 50 characters");

        RuleFor(x => x.EmployeeNumber)
            .NotEmpty().WithMessage("Employee number is required")
            .MaximumLength(20).WithMessage("Employee number cannot exceed 20 characters");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(100).WithMessage("Email cannot exceed 100 characters");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).WithMessage("Phone number cannot exceed 20 characters");

        RuleFor(x => x.TerminationDate)
            .GreaterThan(x => x.HireDate).WithMessage("Termination date must be after hire date")
            .When(x => x.TerminationDate.HasValue);

        RuleFor(x => x.CurrentSalary)
            .GreaterThanOrEqualTo(0).WithMessage("Salary cannot be negative")
            .When(x => x.CurrentSalary.HasValue);

        RuleFor(x => x.Address)
            .MaximumLength(200).WithMessage("Address cannot exceed 200 characters");

        RuleFor(x => x.City)
            .MaximumLength(50).WithMessage("City cannot exceed 50 characters");

        RuleFor(x => x.PostalCode)
            .MaximumLength(10).WithMessage("Postal code cannot exceed 10 characters");

        RuleFor(x => x.Country)
            .MaximumLength(50).WithMessage("Country cannot exceed 50 characters");

        RuleFor(x => x.EmergencyContactName)
            .MaximumLength(100).WithMessage("Emergency contact name cannot exceed 100 characters");

        RuleFor(x => x.EmergencyContactPhone)
            .MaximumLength(20).WithMessage("Emergency contact phone cannot exceed 20 characters");

        RuleFor(x => x.EmergencyContactRelation)
            .MaximumLength(50).WithMessage("Emergency contact relation cannot exceed 50 characters");
    }
}