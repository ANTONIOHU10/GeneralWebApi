using FluentValidation;

namespace GeneralWebApi.Application.Features.Employees.Validators;

public class EmployeeIdValidator : AbstractValidator<int>
{
    public EmployeeIdValidator()
    {
        RuleFor(x => x)
            .GreaterThan(0).WithMessage("Employee ID must be greater than 0");
    }
}