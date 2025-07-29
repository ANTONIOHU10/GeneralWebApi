using GeneralWebApi.Contracts.Requests;
using FluentValidation;

namespace GeneralWebApi.Contracts.Validators.AuthValidators;

public class LogoutRequestValidator : AbstractValidator<LogoutRequest>
{
    public LogoutRequestValidator()
    {
        RuleFor(x => x.RefreshToken)
            .NotEmpty().WithMessage("Refresh token is required")
            .MinimumLength(32).WithMessage("Invalid refresh token format");
    }
}