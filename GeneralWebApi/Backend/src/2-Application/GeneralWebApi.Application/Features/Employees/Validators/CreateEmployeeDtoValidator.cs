using FluentValidation;
using GeneralWebApi.DTOs.Employee;

namespace GeneralWebApi.Application.Features.Employees.Validators;

//fluent validation
public class CreateEmployeeDtoValidator : AbstractValidator<CreateEmployeeDto>
{
    public CreateEmployeeDtoValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(50).WithMessage("First name cannot exceed 50 characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(50).WithMessage("Last name cannot exceed 50 characters");

        // Employee number is optional on create; when provided, validate format/length
        When(x => !string.IsNullOrWhiteSpace(x.EmployeeNumber), () =>
        {
            RuleFor(x => x.EmployeeNumber!)
                .MaximumLength(20).WithMessage("Employee number cannot exceed 20 characters");
        });

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(100).WithMessage("Email cannot exceed 100 characters");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).WithMessage("Phone number cannot exceed 20 characters");

        RuleFor(x => x.HireDate)
            .NotEmpty().WithMessage("Hire date is required")
            .LessThanOrEqualTo(DateTime.Today).WithMessage("Hire date cannot be in the future");

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

        RuleFor(x => x.TaxCode)
            .NotEmpty().WithMessage("Tax code is required")
            .MaximumLength(50).WithMessage("Tax code cannot exceed 50 characters");
    }
}