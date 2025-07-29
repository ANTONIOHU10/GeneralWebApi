using FluentValidation;
using GeneralWebApi.Contracts.Requests;

namespace GeneralWebApi.Contracts.Validators.AuthValidators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {

    }
}