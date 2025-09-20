using GeneralWebApi.Application.Features.Contracts.Commands;
using GeneralWebApi.Application.Features.Contracts.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Contract;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Business;

public class ContractsController : BaseController
{
    private readonly IMediator _mediator;

    public ContractsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ContractListDto>>>> GetContracts([FromQuery] ContractSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var query = new GetContractsQuery { ContractSearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<ContractListDto>>.SuccessResult(result, "Contracts retrieved successfully"));
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ContractDto>>> GetContract(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetContractByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<ContractDto>.SuccessResult(result, "Contract retrieved successfully"));
        });
    }

    [HttpPost]
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

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ContractDto>>> UpdateContract([FromBody] UpdateContractDto updateDto)
    {
        return await ValidateAndExecuteAsync(updateDto, async (validatedDto) =>
        {
            var command = new UpdateContractCommand { UpdateContractDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<ContractDto>.SuccessResult(result, "Contract updated successfully"));
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<ContractDto>>> DeleteContract(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteContractCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<ContractDto>.SuccessResult(result, "Contract deleted successfully"));
        });
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<ApiResponse<List<ContractDto>>>> GetContractsByEmployee(int employeeId)
    {
        return await ValidateAndExecuteAsync(employeeId, async (validatedId) =>
        {
            var query = new GetContractsByEmployeeQuery { EmployeeId = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<ContractDto>>.SuccessResult(result, "Employee contracts retrieved successfully"));
        });
    }

    [HttpGet("expiring")]
    public async Task<ActionResult<ApiResponse<List<ContractDto>>>> GetExpiringContracts([FromQuery] DateTime expiryDate)
    {
        var query = new GetExpiringContractsQuery { ExpiryDate = expiryDate };
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<ContractDto>>.SuccessResult(result, "Expiring contracts retrieved successfully"));
    }

    [HttpGet("status/{status}")]
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





