using FluentValidation;

namespace GeneralWebApi.Application.Features.Certifications.Validators;

public class CertificationIdValidator : AbstractValidator<int>
{
    public CertificationIdValidator()
    {
        RuleFor(x => x)
            .GreaterThan(0).WithMessage("Certification ID must be greater than 0");
    }
}

