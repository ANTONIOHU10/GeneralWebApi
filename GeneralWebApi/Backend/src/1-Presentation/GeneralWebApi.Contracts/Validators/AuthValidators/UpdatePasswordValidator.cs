using FluentValidation;
using GeneralWebApi.Contracts.Requests;

namespace GeneralWebApi.Contracts.Validators.AuthValidators;

public class UpdatePasswordValidator : AbstractValidator<UpdatePasswordRequest>
{
    public UpdatePasswordValidator()
    {
        RuleFor(x => x.Username)
            .NotEmpty().WithMessage("Username is required")
            .Length(3, 18).WithMessage("Username must be between 3 and 18 characters long")
            .Matches(@"^[a-zA-Z0-9]+$").WithMessage("Username must contain only letters and numbers");

        RuleFor(x => x.OldPassword)
            .NotEmpty().WithMessage("Old password is required");

        RuleFor(x => x.NewPassword)
            .NotEmpty().WithMessage("New password is required")
            .MinimumLength(8).WithMessage("New password must be at least 8 characters long")
            .Matches("[A-Z]").WithMessage("New password must contain at least one uppercase letter")
            .Matches("[a-z]").WithMessage("New password must contain at least one lowercase letter")
            .Matches("[0-9]").WithMessage("New password must contain at least one number")
            .Matches("[@$!%*?&]").WithMessage("New password must contain at least one special symbol")
            .NotEqual(x => x.OldPassword).WithMessage("New password must be different from old password")
            //new password must have at least 4 character different from old passsword;
            .Must((request, newPassword) =>
            {
                if (string.IsNullOrEmpty(request.OldPassword) || string.IsNullOrEmpty(newPassword))
                {
                    return false;
                }

                var minLength = Math.Min(request.OldPassword.Length, newPassword.Length);
                var differentChars = 0;
                for (int i = 0; i < minLength; i++)
                {
                    if (request.OldPassword[i] != newPassword[i])
                    {
                        differentChars++;
                    }
                }

                return differentChars >= 4;
            }).WithMessage("New password must have at least 4 characters different from old password");
    }
}