using GeneralWebApi.DTOs.Common;

namespace GeneralWebApi.Application.Services;

/// <summary>
/// Enum Value Service Interface
/// </summary>
public interface IEnumValueService
{
    /// <summary>
    /// Get all enum values
    /// </summary>
    Task<EnumValuesResponse> GetAllEnumValuesAsync();

    /// <summary>
    /// Get contract related enum values
    /// </summary>
    Task<List<EnumValueDto>> GetContractTypesAsync();
    Task<List<EnumValueDto>> GetContractStatusesAsync();

    /// <summary>
    /// Get certification related enum values
    /// </summary>
    Task<List<EnumValueDto>> GetCertificationTypesAsync();
    Task<List<EnumValueDto>> GetCertificationStatusesAsync();

    /// <summary>
    /// Get identity document related enum values
    /// </summary>
    Task<List<EnumValueDto>> GetIdentityDocumentTypesAsync();
    Task<List<EnumValueDto>> GetCountriesAsync();

    /// <summary>
    /// Get education related enum values
    /// </summary>
    Task<List<EnumValueDto>> GetEducationDegreesAsync();
    Task<List<EnumValueDto>> GetEducationFieldsOfStudyAsync();
    Task<List<EnumValueDto>> GetEducationGradesAsync();

    /// <summary>
    /// Get employee related enum values
    /// </summary>
    Task<List<EnumValueDto>> GetEmployeeGendersAsync();
    Task<List<EnumValueDto>> GetEmployeeMaritalStatusesAsync();
    Task<List<EnumValueDto>> GetEmployeeEmploymentStatusesAsync();
    Task<List<EnumValueDto>> GetEmployeeEmploymentTypesAsync();
    Task<List<EnumValueDto>> GetEmployeeEmergencyContactRelationsAsync();
    Task<List<EnumValueDto>> GetEmployeeSalaryCurrenciesAsync();

    /// <summary>
    /// Get department related enum values
    /// </summary>
    Task<List<EnumValueDto>> GetDepartmentLevelsAsync();

    /// <summary>
    /// Get position related enum values
    /// </summary>
    Task<List<EnumValueDto>> GetPositionLevelsAsync();
    Task<List<EnumValueDto>> GetPositionTypesAsync();

    /// <summary>
    /// Get external API configuration related enum values
    /// </summary>
    Task<List<EnumValueDto>> GetHttpMethodsAsync();
    Task<List<EnumValueDto>> GetApiCategoriesAsync();

    /// <summary>
    /// Get user related enum values
    /// </summary>
    Task<List<EnumValueDto>> GetUserRolesAsync();

    /// <summary>
    /// Get common enum values
    /// </summary>
    Task<List<EnumValueDto>> GetCommonStatusesAsync();
    Task<List<EnumValueDto>> GetYesNoOptionsAsync();
    Task<List<EnumValueDto>> GetTrueFalseOptionsAsync();

    /// <summary>
    /// Get enum values by group name
    /// </summary>
    Task<SpecificEnumValuesResponse> GetEnumValuesByGroupAsync(string groupName);
}

