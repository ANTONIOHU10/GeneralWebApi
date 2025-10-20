using FluentValidation;

namespace GeneralWebApi.Application.Features.Departments.Validators;

public class DepartmentIdValidator : AbstractValidator<int>
{
    public DepartmentIdValidator()
    {
        RuleFor(x => x)
            .GreaterThan(0).WithMessage("Department ID must be greater than 0");
    }
}





