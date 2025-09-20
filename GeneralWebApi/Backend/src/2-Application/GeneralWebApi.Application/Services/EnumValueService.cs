using GeneralWebApi.DTOs.Common;
using GeneralWebApi.Domain.Shared.Constants;

namespace GeneralWebApi.Application.Services;

/// <summary>
/// Enum Value Service Implementation
/// </summary>
public class EnumValueService : IEnumValueService
{
    public async Task<EnumValuesResponse> GetAllEnumValuesAsync()
    {
        var response = new EnumValuesResponse();

        // Contract related
        response.Groups["ContractTypes"] = new EnumValueGroupDto
        {
            GroupName = "ContractTypes",
            GroupDisplayName = "Contract Types",
            Values = await GetContractTypesAsync()
        };

        response.Groups["ContractStatuses"] = new EnumValueGroupDto
        {
            GroupName = "ContractStatuses",
            GroupDisplayName = "Contract Statuses",
            Values = await GetContractStatusesAsync()
        };

        // Certification related
        response.Groups["CertificationTypes"] = new EnumValueGroupDto
        {
            GroupName = "CertificationTypes",
            GroupDisplayName = "Certification Types",
            Values = await GetCertificationTypesAsync()
        };

        response.Groups["CertificationStatuses"] = new EnumValueGroupDto
        {
            GroupName = "CertificationStatuses",
            GroupDisplayName = "Certification Statuses",
            Values = await GetCertificationStatusesAsync()
        };

        // Identity document related
        response.Groups["IdentityDocumentTypes"] = new EnumValueGroupDto
        {
            GroupName = "IdentityDocumentTypes",
            GroupDisplayName = "Identity Document Types",
            Values = await GetIdentityDocumentTypesAsync()
        };

        response.Groups["Countries"] = new EnumValueGroupDto
        {
            GroupName = "Countries",
            GroupDisplayName = "Countries",
            Values = await GetCountriesAsync()
        };

        // Education related
        response.Groups["EducationDegrees"] = new EnumValueGroupDto
        {
            GroupName = "EducationDegrees",
            GroupDisplayName = "Education Degrees",
            Values = await GetEducationDegreesAsync()
        };

        response.Groups["EducationFieldsOfStudy"] = new EnumValueGroupDto
        {
            GroupName = "EducationFieldsOfStudy",
            GroupDisplayName = "Fields of Study",
            Values = await GetEducationFieldsOfStudyAsync()
        };

        response.Groups["EducationGrades"] = new EnumValueGroupDto
        {
            GroupName = "EducationGrades",
            GroupDisplayName = "Education Grades",
            Values = await GetEducationGradesAsync()
        };

        // Employee related
        response.Groups["EmployeeGenders"] = new EnumValueGroupDto
        {
            GroupName = "EmployeeGenders",
            GroupDisplayName = "Genders",
            Values = await GetEmployeeGendersAsync()
        };

        response.Groups["EmployeeMaritalStatuses"] = new EnumValueGroupDto
        {
            GroupName = "EmployeeMaritalStatuses",
            GroupDisplayName = "Marital Statuses",
            Values = await GetEmployeeMaritalStatusesAsync()
        };

        response.Groups["EmployeeEmploymentStatuses"] = new EnumValueGroupDto
        {
            GroupName = "EmployeeEmploymentStatuses",
            GroupDisplayName = "Employment Statuses",
            Values = await GetEmployeeEmploymentStatusesAsync()
        };

        response.Groups["EmployeeEmploymentTypes"] = new EnumValueGroupDto
        {
            GroupName = "EmployeeEmploymentTypes",
            GroupDisplayName = "Employment Types",
            Values = await GetEmployeeEmploymentTypesAsync()
        };

        response.Groups["EmployeeEmergencyContactRelations"] = new EnumValueGroupDto
        {
            GroupName = "EmployeeEmergencyContactRelations",
            GroupDisplayName = "Emergency Contact Relations",
            Values = await GetEmployeeEmergencyContactRelationsAsync()
        };

        response.Groups["EmployeeSalaryCurrencies"] = new EnumValueGroupDto
        {
            GroupName = "EmployeeSalaryCurrencies",
            GroupDisplayName = "Salary Currencies",
            Values = await GetEmployeeSalaryCurrenciesAsync()
        };

        // Department related
        response.Groups["DepartmentLevels"] = new EnumValueGroupDto
        {
            GroupName = "DepartmentLevels",
            GroupDisplayName = "Department Levels",
            Values = await GetDepartmentLevelsAsync()
        };

        // Position related
        response.Groups["PositionLevels"] = new EnumValueGroupDto
        {
            GroupName = "PositionLevels",
            GroupDisplayName = "Position Levels",
            Values = await GetPositionLevelsAsync()
        };

        response.Groups["PositionTypes"] = new EnumValueGroupDto
        {
            GroupName = "PositionTypes",
            GroupDisplayName = "Position Types",
            Values = await GetPositionTypesAsync()
        };

        // External API configuration related
        response.Groups["HttpMethods"] = new EnumValueGroupDto
        {
            GroupName = "HttpMethods",
            GroupDisplayName = "HTTP Methods",
            Values = await GetHttpMethodsAsync()
        };

        response.Groups["ApiCategories"] = new EnumValueGroupDto
        {
            GroupName = "ApiCategories",
            GroupDisplayName = "API Categories",
            Values = await GetApiCategoriesAsync()
        };

        // User related
        response.Groups["UserRoles"] = new EnumValueGroupDto
        {
            GroupName = "UserRoles",
            GroupDisplayName = "User Roles",
            Values = await GetUserRolesAsync()
        };

        // Common enum values
        response.Groups["CommonStatuses"] = new EnumValueGroupDto
        {
            GroupName = "CommonStatuses",
            GroupDisplayName = "Common Statuses",
            Values = await GetCommonStatusesAsync()
        };

        response.Groups["YesNoOptions"] = new EnumValueGroupDto
        {
            GroupName = "YesNoOptions",
            GroupDisplayName = "Yes/No Options",
            Values = await GetYesNoOptionsAsync()
        };

        response.Groups["TrueFalseOptions"] = new EnumValueGroupDto
        {
            GroupName = "TrueFalseOptions",
            GroupDisplayName = "True/False Options",
            Values = await GetTrueFalseOptionsAsync()
        };

        return response;
    }

    public async Task<List<EnumValueDto>> GetContractTypesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Contract.ContractTypes, "Contract Types"));
    }

    public async Task<List<EnumValueDto>> GetContractStatusesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Contract.Statuses, "Contract Statuses"));
    }

    public async Task<List<EnumValueDto>> GetCertificationTypesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Certification.Types, "Certification Types"));
    }

    public async Task<List<EnumValueDto>> GetCertificationStatusesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Certification.Statuses, "Certification Statuses"));
    }

    public async Task<List<EnumValueDto>> GetIdentityDocumentTypesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.IdentityDocument.DocumentTypes, "Identity Document Types"));
    }

    public async Task<List<EnumValueDto>> GetCountriesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.IdentityDocument.Countries, "Countries"));
    }

    public async Task<List<EnumValueDto>> GetEducationDegreesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Education.Degrees, "Education Degrees"));
    }

    public async Task<List<EnumValueDto>> GetEducationFieldsOfStudyAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Education.FieldsOfStudy, "Fields of Study"));
    }

    public async Task<List<EnumValueDto>> GetEducationGradesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Education.Grades, "Education Grades"));
    }

    public async Task<List<EnumValueDto>> GetEmployeeGendersAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Employee.Genders, "Genders"));
    }

    public async Task<List<EnumValueDto>> GetEmployeeMaritalStatusesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Employee.MaritalStatuses, "Marital Statuses"));
    }

    public async Task<List<EnumValueDto>> GetEmployeeEmploymentStatusesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Employee.EmploymentStatuses, "Employment Statuses"));
    }

    public async Task<List<EnumValueDto>> GetEmployeeEmploymentTypesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Employee.EmploymentTypes, "Employment Types"));
    }

    public async Task<List<EnumValueDto>> GetEmployeeEmergencyContactRelationsAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Employee.EmergencyContactRelations, "Emergency Contact Relations"));
    }

    public async Task<List<EnumValueDto>> GetEmployeeSalaryCurrenciesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Employee.SalaryCurrencies, "Salary Currencies"));
    }

    public async Task<List<EnumValueDto>> GetDepartmentLevelsAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Department.Levels, "Department Levels"));
    }

    public async Task<List<EnumValueDto>> GetPositionLevelsAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Position.Levels, "Position Levels"));
    }

    public async Task<List<EnumValueDto>> GetPositionTypesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Position.Types, "Position Types"));
    }

    public async Task<List<EnumValueDto>> GetHttpMethodsAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.ExternalApiConfig.HttpMethods, "HTTP Methods"));
    }

    public async Task<List<EnumValueDto>> GetApiCategoriesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.ExternalApiConfig.Categories, "API Categories"));
    }

    public async Task<List<EnumValueDto>> GetUserRolesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.User.Roles, "User Roles"));
    }

    public async Task<List<EnumValueDto>> GetCommonStatusesAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Common.Statuses, "Common Statuses"));
    }

    public async Task<List<EnumValueDto>> GetYesNoOptionsAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Common.YesNo, "Yes/No Options"));
    }

    public async Task<List<EnumValueDto>> GetTrueFalseOptionsAsync()
    {
        return await Task.FromResult(ConvertToStringArray(EnumValues.Common.TrueFalse, "True/False Options"));
    }

    public async Task<SpecificEnumValuesResponse> GetEnumValuesByGroupAsync(string groupName)
    {
        var values = groupName switch
        {
            "ContractTypes" => await GetContractTypesAsync(),
            "ContractStatuses" => await GetContractStatusesAsync(),
            "CertificationTypes" => await GetCertificationTypesAsync(),
            "CertificationStatuses" => await GetCertificationStatusesAsync(),
            "IdentityDocumentTypes" => await GetIdentityDocumentTypesAsync(),
            "Countries" => await GetCountriesAsync(),
            "EducationDegrees" => await GetEducationDegreesAsync(),
            "EducationFieldsOfStudy" => await GetEducationFieldsOfStudyAsync(),
            "EducationGrades" => await GetEducationGradesAsync(),
            "EmployeeGenders" => await GetEmployeeGendersAsync(),
            "EmployeeMaritalStatuses" => await GetEmployeeMaritalStatusesAsync(),
            "EmployeeEmploymentStatuses" => await GetEmployeeEmploymentStatusesAsync(),
            "EmployeeEmploymentTypes" => await GetEmployeeEmploymentTypesAsync(),
            "EmployeeEmergencyContactRelations" => await GetEmployeeEmergencyContactRelationsAsync(),
            "EmployeeSalaryCurrencies" => await GetEmployeeSalaryCurrenciesAsync(),
            "DepartmentLevels" => await GetDepartmentLevelsAsync(),
            "PositionLevels" => await GetPositionLevelsAsync(),
            "PositionTypes" => await GetPositionTypesAsync(),
            "HttpMethods" => await GetHttpMethodsAsync(),
            "ApiCategories" => await GetApiCategoriesAsync(),
            "UserRoles" => await GetUserRolesAsync(),
            "CommonStatuses" => await GetCommonStatusesAsync(),
            "YesNoOptions" => await GetYesNoOptionsAsync(),
            "TrueFalseOptions" => await GetTrueFalseOptionsAsync(),
            _ => new List<EnumValueDto>()
        };

        return new SpecificEnumValuesResponse
        {
            Values = values,
            GroupName = groupName,
            LastUpdated = DateTime.UtcNow
        };
    }

    /// <summary>
    /// Convert string array to EnumValueDto list
    /// </summary>
    private static List<EnumValueDto> ConvertToStringArray(string[] values, string category)
    {
        return values.Select((value, index) => new EnumValueDto
        {
            Value = value,
            DisplayName = GetDisplayName(value),
            Description = GetDescription(value, category),
            SortOrder = index,
            IsDefault = index == 0
        }).ToList();
    }

    /// <summary>
    /// Get display name
    /// </summary>
    private static string GetDisplayName(string value)
    {
        return value switch
        {
            "Indefinite" => "Indefinite Term",
            "Fixed" => "Fixed Term",
            "PartTime" => "Part-time",
            "Temporary" => "Temporary",
            "Internship" => "Internship",
            "Consultant" => "Consultant",
            "Freelance" => "Freelance",
            "Seasonal" => "Seasonal",
            "Active" => "Active",
            "Inactive" => "Inactive",
            "Expired" => "Expired",
            "Terminated" => "Terminated",
            "Pending" => "Pending",
            "Suspended" => "Suspended",
            "Renewed" => "Renewed",
            "Valid" => "Valid",
            "Revoked" => "Revoked",
            "Male" => "Male",
            "Female" => "Female",
            "Other" => "Other",
            "PreferNotToSay" => "Prefer Not to Say",
            "Single" => "Single",
            "Married" => "Married",
            "Divorced" => "Divorced",
            "Widowed" => "Widowed",
            "Separated" => "Separated",
            "Cohabiting" => "Cohabiting",
            "OnLeave" => "On Leave",
            "Retired" => "Retired",
            "FullTime" => "Full-time",
            "Contract" => "Contract",
            "Intern" => "Intern",
            "Spouse" => "Spouse",
            "Parent" => "Parent",
            "Child" => "Child",
            "Sibling" => "Sibling",
            "Friend" => "Friend",
            "CNY" => "Chinese Yuan",
            "USD" => "US Dollar",
            "EUR" => "Euro",
            "GBP" => "British Pound",
            "JPY" => "Japanese Yen",
            "AUD" => "Australian Dollar",
            "CAD" => "Canadian Dollar",
            "CHF" => "Swiss Franc",
            "HKD" => "Hong Kong Dollar",
            "SGD" => "Singapore Dollar",
            "China" => "China",
            "United States" => "United States",
            "United Kingdom" => "United Kingdom",
            "Germany" => "Germany",
            "France" => "France",
            "Japan" => "Japan",
            "South Korea" => "South Korea",
            "Canada" => "Canada",
            "Australia" => "Australia",
            "Italy" => "Italy",
            "Bachelor" => "Bachelor's Degree",
            "Master" => "Master's Degree",
            "Doctorate" => "Doctorate",
            "Associate" => "Associate Degree",
            "Certificate" => "Certificate",
            "Diploma" => "Diploma",
            "High School" => "High School",
            "Vocational" => "Vocational",
            "Postgraduate" => "Postgraduate",
            "Professional" => "Professional",
            "Computer Science" => "Computer Science",
            "Business Administration" => "Business Administration",
            "Engineering" => "Engineering",
            "Medicine" => "Medicine",
            "Law" => "Law",
            "Education" => "Education",
            "Arts" => "Arts",
            "Sciences" => "Sciences",
            "Mathematics" => "Mathematics",
            "Physics" => "Physics",
            "Chemistry" => "Chemistry",
            "Biology" => "Biology",
            "Economics" => "Economics",
            "Finance" => "Finance",
            "Marketing" => "Marketing",
            "Psychology" => "Psychology",
            "Sociology" => "Sociology",
            "History" => "History",
            "Literature" => "Literature",
            "Languages" => "Languages",
            "Management" => "Management",
            "Technical" => "Technical",
            "Administrative" => "Administrative",
            "Sales" => "Sales",
            "HR" => "Human Resources",
            "Operations" => "Operations",
            "Support" => "Support",
            "Executive" => "Executive",
            "Payment" => "Payment",
            "Notification" => "Notification",
            "Authentication" => "Authentication",
            "Data" => "Data",
            "Integration" => "Integration",
            "ThirdParty" => "Third Party",
            "Internal" => "Internal",
            "External" => "External",
            "Admin" => "Administrator",
            "User" => "User",
            "Manager" => "Manager",
            "ReadOnly" => "Read Only",
            "Approved" => "Approved",
            "Rejected" => "Rejected",
            "Deleted" => "Deleted",
            "Yes" => "Yes",
            "No" => "No",
            "True" => "True",
            "False" => "False",
            _ => value
        };
    }

    /// <summary>
    /// Get description
    /// </summary>
    private static string GetDescription(string value, string category)
    {
        return $"{category} - {GetDisplayName(value)}";
    }
}

