using GeneralWebApi.Application.Services;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.DTOs.Common;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.v1;

/// <summary>
/// Enum Values Controller
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[ApiVersion("1.0")]
public class EnumValuesController : BaseController
{
    private readonly IEnumValueService _enumValueService;

    public EnumValuesController(IEnumValueService enumValueService)
    {
        _enumValueService = enumValueService;
    }

    /// <summary>
    /// Get all enum values
    /// </summary>
    /// <returns>All enum values</returns>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<EnumValuesResponse>), 200)]
    public async Task<ActionResult<ApiResponse<EnumValuesResponse>>> GetAllEnumValues()
    {
        var result = await _enumValueService.GetAllEnumValuesAsync();
        return Ok(ApiResponse<EnumValuesResponse>.SuccessResult(result, "All enum values retrieved successfully"));
    }

    /// <summary>
    /// Get enum values by group name
    /// </summary>
    /// <param name="groupName">Group name</param>
    /// <returns>Specific group enum values</returns>
    [HttpGet("{groupName}")]
    [ProducesResponseType(typeof(ApiResponse<SpecificEnumValuesResponse>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    public async Task<ActionResult<ApiResponse<SpecificEnumValuesResponse>>> GetEnumValuesByGroup(string groupName)
    {
        var result = await _enumValueService.GetEnumValuesByGroupAsync(groupName);

        if (!result.Values.Any())
        {
            return NotFound(ApiResponse<object>.NotFound($"Enum value group '{groupName}' not found"));
        }

        return Ok(ApiResponse<SpecificEnumValuesResponse>.SuccessResult(result, $"Enum values for group '{groupName}' retrieved successfully"));
    }

    #region Contract Related Enum Values

    /// <summary>
    /// Get contract types
    /// </summary>
    /// <returns>Contract types list</returns>
    [HttpGet("contract-types")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetContractTypes()
    {
        var result = await _enumValueService.GetContractTypesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Contract types retrieved successfully"));
    }

    /// <summary>
    /// Get contract statuses
    /// </summary>
    /// <returns>Contract statuses list</returns>
    [HttpGet("contract-statuses")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetContractStatuses()
    {
        var result = await _enumValueService.GetContractStatusesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Contract statuses retrieved successfully"));
    }

    #endregion

    #region Certification Related Enum Values

    /// <summary>
    /// Get certification types
    /// </summary>
    /// <returns>Certification types list</returns>
    [HttpGet("certification-types")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetCertificationTypes()
    {
        var result = await _enumValueService.GetCertificationTypesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Certification types retrieved successfully"));
    }

    /// <summary>
    /// Get certification statuses
    /// </summary>
    /// <returns>Certification statuses list</returns>
    [HttpGet("certification-statuses")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetCertificationStatuses()
    {
        var result = await _enumValueService.GetCertificationStatusesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Certification statuses retrieved successfully"));
    }

    #endregion

    #region Identity Document Related Enum Values

    /// <summary>
    /// Get identity document types
    /// </summary>
    /// <returns>Identity document types list</returns>
    [HttpGet("identity-document-types")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetIdentityDocumentTypes()
    {
        var result = await _enumValueService.GetIdentityDocumentTypesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Identity document types retrieved successfully"));
    }

    /// <summary>
    /// Get countries list
    /// </summary>
    /// <returns>Countries list</returns>
    [HttpGet("countries")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetCountries()
    {
        var result = await _enumValueService.GetCountriesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Countries retrieved successfully"));
    }

    #endregion

    #region Education Related Enum Values

    /// <summary>
    /// Get education degrees
    /// </summary>
    /// <returns>Education degrees list</returns>
    [HttpGet("education-degrees")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetEducationDegrees()
    {
        var result = await _enumValueService.GetEducationDegreesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Education degrees retrieved successfully"));
    }

    /// <summary>
    /// Get education fields of study
    /// </summary>
    /// <returns>Education fields of study list</returns>
    [HttpGet("education-fields-of-study")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetEducationFieldsOfStudy()
    {
        var result = await _enumValueService.GetEducationFieldsOfStudyAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Education fields of study retrieved successfully"));
    }

    /// <summary>
    /// Get education grades
    /// </summary>
    /// <returns>Education grades list</returns>
    [HttpGet("education-grades")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetEducationGrades()
    {
        var result = await _enumValueService.GetEducationGradesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Education grades retrieved successfully"));
    }

    #endregion

    #region Employee Related Enum Values

    /// <summary>
    /// Get employee genders
    /// </summary>
    /// <returns>Employee genders list</returns>
    [HttpGet("employee-genders")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetEmployeeGenders()
    {
        var result = await _enumValueService.GetEmployeeGendersAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Employee genders retrieved successfully"));
    }

    /// <summary>
    /// Get employee marital statuses
    /// </summary>
    /// <returns>Employee marital statuses list</returns>
    [HttpGet("employee-marital-statuses")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetEmployeeMaritalStatuses()
    {
        var result = await _enumValueService.GetEmployeeMaritalStatusesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Employee marital statuses retrieved successfully"));
    }

    /// <summary>
    /// Get employee employment statuses
    /// </summary>
    /// <returns>Employee employment statuses list</returns>
    [HttpGet("employee-employment-statuses")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetEmployeeEmploymentStatuses()
    {
        var result = await _enumValueService.GetEmployeeEmploymentStatusesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Employee employment statuses retrieved successfully"));
    }

    /// <summary>
    /// Get employee employment types
    /// </summary>
    /// <returns>Employee employment types list</returns>
    [HttpGet("employee-employment-types")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetEmployeeEmploymentTypes()
    {
        var result = await _enumValueService.GetEmployeeEmploymentTypesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Employee employment types retrieved successfully"));
    }

    /// <summary>
    /// Get employee emergency contact relations
    /// </summary>
    /// <returns>Employee emergency contact relations list</returns>
    [HttpGet("employee-emergency-contact-relations")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetEmployeeEmergencyContactRelations()
    {
        var result = await _enumValueService.GetEmployeeEmergencyContactRelationsAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Employee emergency contact relations retrieved successfully"));
    }

    /// <summary>
    /// Get employee salary currencies
    /// </summary>
    /// <returns>Employee salary currencies list</returns>
    [HttpGet("employee-salary-currencies")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetEmployeeSalaryCurrencies()
    {
        var result = await _enumValueService.GetEmployeeSalaryCurrenciesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Employee salary currencies retrieved successfully"));
    }

    #endregion

    #region Department Related Enum Values

    /// <summary>
    /// Get department levels
    /// </summary>
    /// <returns>Department levels list</returns>
    [HttpGet("department-levels")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetDepartmentLevels()
    {
        var result = await _enumValueService.GetDepartmentLevelsAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Department levels retrieved successfully"));
    }

    #endregion

    #region Position Related Enum Values

    /// <summary>
    /// Get position levels
    /// </summary>
    /// <returns>Position levels list</returns>
    [HttpGet("position-levels")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetPositionLevels()
    {
        var result = await _enumValueService.GetPositionLevelsAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Position levels retrieved successfully"));
    }

    /// <summary>
    /// Get position types
    /// </summary>
    /// <returns>Position types list</returns>
    [HttpGet("position-types")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetPositionTypes()
    {
        var result = await _enumValueService.GetPositionTypesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Position types retrieved successfully"));
    }

    #endregion

    #region External API Configuration Related Enum Values

    /// <summary>
    /// Get HTTP methods
    /// </summary>
    /// <returns>HTTP methods list</returns>
    [HttpGet("http-methods")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetHttpMethods()
    {
        var result = await _enumValueService.GetHttpMethodsAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "HTTP methods retrieved successfully"));
    }

    /// <summary>
    /// Get API categories
    /// </summary>
    /// <returns>API categories list</returns>
    [HttpGet("api-categories")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetApiCategories()
    {
        var result = await _enumValueService.GetApiCategoriesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "API categories retrieved successfully"));
    }

    #endregion

    #region User Related Enum Values

    /// <summary>
    /// Get user roles
    /// </summary>
    /// <returns>User roles list</returns>
    [HttpGet("user-roles")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetUserRoles()
    {
        var result = await _enumValueService.GetUserRolesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "User roles retrieved successfully"));
    }

    #endregion

    #region Common Enum Values

    /// <summary>
    /// Get common statuses
    /// </summary>
    /// <returns>Common statuses list</returns>
    [HttpGet("common-statuses")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetCommonStatuses()
    {
        var result = await _enumValueService.GetCommonStatusesAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Common statuses retrieved successfully"));
    }

    /// <summary>
    /// Get Yes/No options
    /// </summary>
    /// <returns>Yes/No options list</returns>
    [HttpGet("yes-no-options")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetYesNoOptions()
    {
        var result = await _enumValueService.GetYesNoOptionsAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "Yes/No options retrieved successfully"));
    }

    /// <summary>
    /// Get True/False options
    /// </summary>
    /// <returns>True/False options list</returns>
    [HttpGet("true-false-options")]
    [ProducesResponseType(typeof(ApiResponse<List<EnumValueDto>>), 200)]
    public async Task<ActionResult<ApiResponse<List<EnumValueDto>>>> GetTrueFalseOptions()
    {
        var result = await _enumValueService.GetTrueFalseOptionsAsync();
        return Ok(ApiResponse<List<EnumValueDto>>.SuccessResult(result, "True/False options retrieved successfully"));
    }

    #endregion
}

