using FluentValidation;
using GeneralWebApi.Contracts.Requests;

namespace GeneralWebApi.Contracts.Validators.AuthValidators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required")
            .Length(3, 18).WithMessage("Username must be between 3 and 18 characters long")
            .Matches(@"^[a-zA-Z0-9]+$").WithMessage("Username must contain only letters and numbers");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email address");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .Matches("[A-Z]").WithMessage("Password must contain at least one uppercase letter")
            .Matches("[a-z]").WithMessage("Password must contain at least one lowercase letter")
            .Matches("[0-9]").WithMessage("Password must contain at least one number")
            .Matches("[@$!%*?&]").WithMessage("Password must contain at least one special symbol");
    }
}