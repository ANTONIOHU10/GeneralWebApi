using FluentValidation;
using GeneralWebApi.Contracts.Requests;

namespace GeneralWebApi.Contracts.Validators.ExternalApiConfigValidators;

/// <summary>
/// Validator for creating external API configuration
/// </summary>
public class CreateExternalApiConfigValidator : AbstractValidator<ExternalApiConfigRequest>
{
    public CreateExternalApiConfigValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters")
            .Matches(@"^[a-zA-Z0-9\s\-_]+$").WithMessage("Name can only contain letters, numbers, spaces, hyphens, and underscores");

        RuleFor(x => x.BaseUrl)
            .NotEmpty().WithMessage("BaseUrl is required")
            .Must(BeValidUrl).WithMessage("BaseUrl must be a valid URL")
            .MaximumLength(500).WithMessage("BaseUrl cannot exceed 500 characters");

        RuleFor(x => x.ApiKey)
            .MaximumLength(100).WithMessage("ApiKey cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.ApiKey));

        RuleFor(x => x.AuthToken)
            .MaximumLength(100).WithMessage("AuthToken cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.AuthToken));

        RuleFor(x => x.Username)
            .MaximumLength(100).WithMessage("Username cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Username));

        RuleFor(x => x.Password)
            .MaximumLength(100).WithMessage("Password cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Password));

        RuleFor(x => x.ClientId)
            .MaximumLength(100).WithMessage("ClientId cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.ClientId));

        RuleFor(x => x.ClientSecret)
            .MaximumLength(100).WithMessage("ClientSecret cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.ClientSecret));

        RuleFor(x => x.Endpoint)
            .MaximumLength(200).WithMessage("Endpoint cannot exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Endpoint))
            .Must(BeValidEndpoint).WithMessage("Endpoint must be a valid path")
            .When(x => !string.IsNullOrEmpty(x.Endpoint));

        RuleFor(x => x.HttpMethod)
            .NotEmpty().WithMessage("HttpMethod is required")
            .MaximumLength(10).WithMessage("HttpMethod cannot exceed 10 characters")
            .Must(BeValidHttpMethod).WithMessage("HttpMethod must be GET, POST, PUT, DELETE, PATCH, HEAD, or OPTIONS");

        RuleFor(x => x.Headers)
            .MaximumLength(1000).WithMessage("Headers cannot exceed 1000 characters")
            .When(x => !string.IsNullOrEmpty(x.Headers))
            .Must(BeValidJsonOrEmpty).WithMessage("Headers must be valid JSON format")
            .When(x => !string.IsNullOrEmpty(x.Headers));

        RuleFor(x => x.TimeoutSeconds)
            .InclusiveBetween(1, 300).WithMessage("TimeoutSeconds must be between 1 and 300");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.Description));

        RuleFor(x => x.Category)
            .MaximumLength(100).WithMessage("Category cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.Category));

        // business rules validation
        RuleFor(x => x)
            .Must(HaveValidAuthentication).WithMessage("Must provide at least one authentication method (ApiKey, AuthToken, Username/Password, or ClientId/ClientSecret)")
            .When(x => !string.IsNullOrEmpty(x.ApiKey) || !string.IsNullOrEmpty(x.AuthToken) ||
                      !string.IsNullOrEmpty(x.Username) || !string.IsNullOrEmpty(x.Password) ||
                      !string.IsNullOrEmpty(x.ClientId) || !string.IsNullOrEmpty(x.ClientSecret));
    }

    private bool BeValidUrl(string url)
    {
        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult) &&
               (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }

    private bool BeValidEndpoint(string endpoint)
    {
        if (string.IsNullOrEmpty(endpoint)) return true;
        return endpoint.StartsWith("/") && !endpoint.Contains("..") && endpoint.Length <= 200;
    }

    private bool BeValidHttpMethod(string method)
    {
        var validMethods = new[] { "GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS" };
        return validMethods.Contains(method.ToUpper());
    }

    private bool BeValidJsonOrEmpty(string json)
    {
        if (string.IsNullOrEmpty(json)) return true;
        try
        {
            System.Text.Json.JsonDocument.Parse(json);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private bool HaveValidAuthentication(ExternalApiConfigRequest request)
    {
        // if not provide any authentication info, it is valid (public API)
        if (string.IsNullOrEmpty(request.ApiKey) &&
            string.IsNullOrEmpty(request.AuthToken) &&
            string.IsNullOrEmpty(request.Username) &&
            string.IsNullOrEmpty(request.Password) &&
            string.IsNullOrEmpty(request.ClientId) &&
            string.IsNullOrEmpty(request.ClientSecret))
        {
            return true;
        }

        // if provide username, must provide password
        if (!string.IsNullOrEmpty(request.Username) && string.IsNullOrEmpty(request.Password))
        {
            return false;
        }

        // if provide password, must provide username
        if (!string.IsNullOrEmpty(request.Password) && string.IsNullOrEmpty(request.Username))
        {
            return false;
        }

        // if provide ClientId, must provide ClientSecret
        if (!string.IsNullOrEmpty(request.ClientId) && string.IsNullOrEmpty(request.ClientSecret))
        {
            return false;
        }

        // if provide ClientSecret, must provide ClientId
        if (!string.IsNullOrEmpty(request.ClientSecret) && string.IsNullOrEmpty(request.ClientId))
        {
            return false;
        }

        return true;
    }
}

/// <summary>
/// Validator for updating external API configuration
/// </summary>
public class UpdateExternalApiConfigValidator : AbstractValidator<ExternalApiConfigRequest>
{
    public UpdateExternalApiConfigValidator()
    {
        // inherit all rules from CreateExternalApiConfigValidator
        Include(new CreateExternalApiConfigValidator());

        // add specific rules for update
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(100).WithMessage("Name cannot exceed 100 characters")
            .Matches(@"^[a-zA-Z0-9\s\-_]+$").WithMessage("Name can only contain letters, numbers, spaces, hyphens, and underscores");

        RuleFor(x => x.BaseUrl)
            .NotEmpty().WithMessage("BaseUrl is required")
            .MaximumLength(500).WithMessage("BaseUrl cannot exceed 500 characters");

        RuleFor(x => x.ApiKey)
            .MaximumLength(100).WithMessage("ApiKey cannot exceed 100 characters")
            .When(x => !string.IsNullOrEmpty(x.ApiKey));

        RuleFor(x => x.AuthToken)
            .MaximumLength(100).WithMessage("AuthToken cannot exceed 100 characters");
    }
}