using FluentValidation;

namespace GeneralWebApi.Application.Features.Positions.Validators;

public class PositionIdValidator : AbstractValidator<int>
{
    public PositionIdValidator()
    {
        RuleFor(x => x)
            .GreaterThan(0).WithMessage("Position ID must be greater than 0");
    }
}

