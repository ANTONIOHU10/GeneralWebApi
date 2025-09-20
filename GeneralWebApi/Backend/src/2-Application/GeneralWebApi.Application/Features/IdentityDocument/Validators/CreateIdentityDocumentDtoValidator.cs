using FluentValidation;
using GeneralWebApi.DTOs.IdentityDocument;

namespace GeneralWebApi.Application.Features.IdentityDocument.Validators;

public class CreateIdentityDocumentDtoValidator : AbstractValidator<CreateIdentityDocumentDto>
{
    public CreateIdentityDocumentDtoValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0)
            .WithMessage("Employee ID must be greater than 0");

        RuleFor(x => x.DocumentType)
            .NotEmpty()
            .WithMessage("Document type is required")
            .MaximumLength(50)
            .WithMessage("Document type cannot exceed 50 characters");

        RuleFor(x => x.DocumentNumber)
            .NotEmpty()
            .WithMessage("Document number is required")
            .MaximumLength(100)
            .WithMessage("Document number cannot exceed 100 characters");

        RuleFor(x => x.IssueDate)
            .NotEmpty()
            .WithMessage("Issue date is required")
            .LessThanOrEqualTo(DateTime.Today)
            .WithMessage("Issue date cannot be in the future");

        RuleFor(x => x.ExpirationDate)
            .NotEmpty()
            .WithMessage("Expiration date is required")
            .GreaterThan(x => x.IssueDate)
            .WithMessage("Expiration date must be after issue date");

        RuleFor(x => x.IssuingAuthority)
            .NotEmpty()
            .WithMessage("Issuing authority is required")
            .MaximumLength(200)
            .WithMessage("Issuing authority cannot exceed 200 characters");

        RuleFor(x => x.IssuingPlace)
            .NotEmpty()
            .WithMessage("Issuing place is required")
            .MaximumLength(100)
            .WithMessage("Issuing place cannot exceed 100 characters");

        RuleFor(x => x.IssuingCountry)
            .NotEmpty()
            .WithMessage("Issuing country is required")
            .MaximumLength(100)
            .WithMessage("Issuing country cannot exceed 100 characters");

        RuleFor(x => x.IssuingState)
            .NotEmpty()
            .WithMessage("Issuing state is required")
            .MaximumLength(100)
            .WithMessage("Issuing state cannot exceed 100 characters");

        RuleFor(x => x.Notes)
            .MaximumLength(1000)
            .WithMessage("Notes cannot exceed 1000 characters");
    }
}
