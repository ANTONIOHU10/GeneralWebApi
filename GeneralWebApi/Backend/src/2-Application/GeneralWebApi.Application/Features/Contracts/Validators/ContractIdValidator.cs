using FluentValidation;

namespace GeneralWebApi.Application.Features.Contracts.Validators;

public class ContractIdValidator : AbstractValidator<int>
{
    public ContractIdValidator()
    {
        RuleFor(x => x)
            .GreaterThan(0).WithMessage("Contract ID must be greater than 0");
    }
}

