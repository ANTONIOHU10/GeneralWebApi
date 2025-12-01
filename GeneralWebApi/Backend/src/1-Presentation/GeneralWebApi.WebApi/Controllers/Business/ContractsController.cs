using GeneralWebApi.Application.Features.Contracts.Commands;
using GeneralWebApi.Application.Features.Contracts.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Contract;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Business;

/// <summary>
/// Controller for managing contract data
/// Requires appropriate authorization for different operations
/// </summary>
[Authorize] // Require authentication for all endpoints
public class ContractsController : BaseController
{
    private readonly IMediator _mediator;

    public ContractsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated list of contracts
    /// </summary>
    /// <param name="searchDto">Search criteria</param>
    /// <returns>Paginated contract list</returns>
    [HttpGet]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view contracts
    public async Task<ActionResult<ApiResponse<PagedResult<ContractListDto>>>> GetContracts([FromQuery] ContractSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var query = new GetContractsQuery { ContractSearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<ContractListDto>>.SuccessResult(result, "Contracts retrieved successfully"));
        });
    }

    /// <summary>
    /// Get contract by ID
    /// </summary>
    /// <param name="id">Contract ID</param>
    /// <returns>Contract details</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view contract details
    public async Task<ActionResult<ApiResponse<ContractDto>>> GetContract(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetContractByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<ContractDto>.SuccessResult(result, "Contract retrieved successfully"));
        });
    }

    /// <summary>
    /// Create new contract
    /// </summary>
    /// <param name="createDto">Contract creation data</param>
    /// <returns>Created contract</returns>
    [HttpPost]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can create contracts
    public async Task<ActionResult<ApiResponse<ContractDto>>> CreateContract([FromBody] CreateContractDto createDto)
    {
        return await ValidateAndExecuteAsync(createDto, async (validatedDto) =>
        {
            var command = new CreateContractCommand { CreateContractDto = validatedDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetContract), new { id = result.Id },
                ApiResponse<ContractDto>.SuccessResult(result, "Contract created successfully"));
        });
    }

    /// <summary>
    /// Update contract information
    /// </summary>
    /// <param name="updateDto">Contract update data</param>
    /// <returns>Updated contract</returns>
    [HttpPut("{id}")]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can update contracts
    public async Task<ActionResult<ApiResponse<ContractDto>>> UpdateContract([FromBody] UpdateContractDto updateDto)
    {
        return await ValidateAndExecuteAsync(updateDto, async (validatedDto) =>
        {
            var command = new UpdateContractCommand { UpdateContractDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<ContractDto>.SuccessResult(result, "Contract updated successfully"));
        });
    }

    /// <summary>
    /// Delete contract
    /// </summary>
    /// <param name="id">Contract ID</param>
    /// <returns>Deleted contract</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AdminOnly")] // Only admins can delete contracts
    public async Task<ActionResult<ApiResponse<ContractDto>>> DeleteContract(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteContractCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<ContractDto>.SuccessResult(result, "Contract deleted successfully"));
        });
    }

    /// <summary>
    /// Get contracts by employee
    /// </summary>
    /// <param name="employeeId">Employee ID</param>
    /// <returns>List of employee contracts</returns>
    [HttpGet("employee/{employeeId}")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view employee contracts
    public async Task<ActionResult<ApiResponse<List<ContractDto>>>> GetContractsByEmployee(int employeeId)
    {
        return await ValidateAndExecuteAsync(employeeId, async (validatedId) =>
        {
            var query = new GetContractsByEmployeeQuery { EmployeeId = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<ContractDto>>.SuccessResult(result, "Employee contracts retrieved successfully"));
        });
    }

    /// <summary>
    /// Get expiring contracts
    /// </summary>
    /// <param name="daysFromNow">Number of days from now to check for expiring contracts (default: 30)</param>
    /// <returns>List of expiring contracts</returns>
    [HttpGet("expiring")]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can view expiring contracts
    public async Task<ActionResult<ApiResponse<List<ContractDto>>>> GetExpiringContracts([FromQuery] int daysFromNow = 30)
    {
        return await ValidateAndExecuteAsync(daysFromNow, async (validatedDays) =>
        {
            var query = new GetExpiringContractsQuery { DaysFromNow = validatedDays };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<ContractDto>>.SuccessResult(result, "Expiring contracts retrieved successfully"));
        });
    }

    /// <summary>
    /// Get expired contracts
    /// </summary>
    /// <returns>List of expired contracts</returns>
    [HttpGet("expired")]
    [Authorize(Policy = "ManagerOrAdmin")] // Only managers and admins can view expired contracts
    public async Task<ActionResult<ApiResponse<List<ContractDto>>>> GetExpiredContracts()
    {
        return await ValidateAndExecuteAsync(new object(), async (_) =>
        {
            var query = new GetExpiredContractsQuery();
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<ContractDto>>.SuccessResult(result, "Expired contracts retrieved successfully"));
        });
    }

    /// <summary>
    /// Get contracts by status
    /// </summary>
    /// <param name="status">Contract status</param>
    /// <returns>List of contracts by status</returns>
    [HttpGet("status/{status}")]
    [Authorize(Policy = "AllRoles")] // All authenticated users can view contracts by status
    public async Task<ActionResult<ApiResponse<List<ContractDto>>>> GetContractsByStatus(string status)
    {
        return await ValidateAndExecuteAsync(status, async (validatedStatus) =>
        {
            var query = new GetContractsByStatusQuery { Status = validatedStatus };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<ContractDto>>.SuccessResult(result, "Contracts by status retrieved successfully"));
        });
    }
}





