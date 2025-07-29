using FluentValidation;
using GeneralWebApi.Contracts.Requests;

namespace GeneralWebApi.Contracts.Validators.AuthValidators;

public class RefreshTokenRequestValidator : AbstractValidator<RefreshTokenRequest>
{
    public RefreshTokenRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required")
            .MinimumLength(32).WithMessage("Invalid refresh token format");
    }
}