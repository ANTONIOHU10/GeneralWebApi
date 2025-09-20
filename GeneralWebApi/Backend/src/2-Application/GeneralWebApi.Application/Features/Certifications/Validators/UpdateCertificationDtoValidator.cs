using FluentValidation;
using GeneralWebApi.DTOs.Certification;

namespace GeneralWebApi.Application.Features.Certifications.Validators;

public class UpdateCertificationDtoValidator : AbstractValidator<UpdateCertificationDto>
{
    public UpdateCertificationDtoValidator()
    {
        RuleFor(x => x.Id)
            .GreaterThan(0).WithMessage("Certification ID is required");

        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Employee ID is required");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Certification name is required")
            .MaximumLength(200).WithMessage("Certification name cannot exceed 200 characters");

        RuleFor(x => x.IssuingOrganization)
            .NotEmpty().WithMessage("Issuing organization is required")
            .MaximumLength(200).WithMessage("Issuing organization cannot exceed 200 characters");

        RuleFor(x => x.IssueDate)
            .NotEmpty().WithMessage("Issue date is required")
            .LessThanOrEqualTo(DateTime.Today).WithMessage("Issue date cannot be in the future");

        RuleFor(x => x.ExpiryDate)
            .GreaterThan(x => x.IssueDate).WithMessage("Expiry date must be after issue date")
            .When(x => x.ExpiryDate.HasValue);

        RuleFor(x => x.CredentialId)
            .MaximumLength(100).WithMessage("Credential ID cannot exceed 100 characters");

        RuleFor(x => x.CredentialUrl)
            .MaximumLength(500).WithMessage("Credential URL cannot exceed 500 characters")
            .Must(BeValidUrl).WithMessage("Invalid URL format")
            .When(x => !string.IsNullOrEmpty(x.CredentialUrl));

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes cannot exceed 1000 characters");
    }

    private static bool BeValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url))
            return true;

        return Uri.TryCreate(url, UriKind.Absolute, out var result) &&
               (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }
}



