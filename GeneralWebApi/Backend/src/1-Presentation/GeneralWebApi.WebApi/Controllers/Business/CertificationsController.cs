using GeneralWebApi.Application.Features.Certifications.Commands;
using GeneralWebApi.Application.Features.Certifications.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Certification;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Business;

/// <summary>
/// Controller for managing certification data
/// Requires appropriate authorization for different operations
/// </summary>
[Authorize] // Require authentication for all endpoints
public class CertificationsController : BaseController
{
    private readonly IMediator _mediator;

    public CertificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated list of certifications
    /// </summary>
    /// <param name="searchDto">Search criteria</param>
    /// <returns>Paginated certification list</returns>
    [HttpGet]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view certifications
    public async Task<ActionResult<ApiResponse<PagedResult<CertificationListDto>>>> GetCertifications([FromQuery] CertificationSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var query = new GetCertificationsQuery { CertificationSearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<CertificationListDto>>.SuccessResult(result, "Certifications retrieved successfully"));
        });
    }

    /// <summary>
    /// Get certification by ID
    /// </summary>
    /// <param name="id">Certification ID</param>
    /// <returns>Certification details</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view certification details
    public async Task<ActionResult<ApiResponse<CertificationDto>>> GetCertification(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetCertificationByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<CertificationDto>.SuccessResult(result, "Certification retrieved successfully"));
        });
    }

    /// <summary>
    /// Create new certification
    /// </summary>
    /// <param name="createDto">Certification creation data</param>
    /// <returns>Created certification</returns>
    [HttpPost]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can create certifications
    public async Task<ActionResult<ApiResponse<CertificationDto>>> CreateCertification([FromBody] CreateCertificationDto createDto)
    {
        return await ValidateAndExecuteAsync(createDto, async (validatedDto) =>
        {
            var command = new CreateCertificationCommand { CreateCertificationDto = validatedDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetCertification), new { id = result.Id },
                ApiResponse<CertificationDto>.SuccessResult(result, "Certification created successfully"));
        });
    }

    /// <summary>
    /// Update certification information
    /// </summary>
    /// <param name="updateDto">Certification update data</param>
    /// <returns>Updated certification</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can update certifications
    public async Task<ActionResult<ApiResponse<CertificationDto>>> UpdateCertification([FromBody] UpdateCertificationDto updateDto)
    {
        return await ValidateAndExecuteAsync(updateDto, async (validatedDto) =>
        {
            var command = new UpdateCertificationCommand { UpdateCertificationDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<CertificationDto>.SuccessResult(result, "Certification updated successfully"));
        });
    }

    /// <summary>
    /// Delete certification
    /// </summary>
    /// <param name="id">Certification ID</param>
    /// <returns>Deleted certification</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")] // Only admins can delete certifications
    public async Task<ActionResult<ApiResponse<CertificationDto>>> DeleteCertification(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteCertificationCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<CertificationDto>.SuccessResult(result, "Certification deleted successfully"));
        });
    }

    /// <summary>
    /// Get certifications by employee
    /// </summary>
    /// <param name="employeeId">Employee ID</param>
    /// <returns>List of employee certifications</returns>
    [HttpGet("employee/{employeeId}")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view employee certifications
    public async Task<ActionResult<ApiResponse<List<CertificationDto>>>> GetCertificationsByEmployee(int employeeId)
    {
        return await ValidateAndExecuteAsync(employeeId, async (validatedId) =>
        {
            var query = new GetCertificationsByEmployeeQuery { EmployeeId = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<CertificationDto>>.SuccessResult(result, "Employee certifications retrieved successfully"));
        });
    }

    /// <summary>
    /// Get expiring certifications
    /// </summary>
    /// <param name="expiryDate">Expiry date filter</param>
    /// <returns>List of expiring certifications</returns>
    [HttpGet("expiring")]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can view expiring certifications
    public async Task<ActionResult<ApiResponse<List<CertificationDto>>>> GetExpiringCertifications([FromQuery] DateTime expiryDate)
    {
        var query = new GetExpiringCertificationsQuery { ExpiryDate = expiryDate };
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<CertificationDto>>.SuccessResult(result, "Expiring certifications retrieved successfully"));
    }
}





