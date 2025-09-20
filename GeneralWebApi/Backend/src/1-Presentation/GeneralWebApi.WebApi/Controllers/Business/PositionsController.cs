using GeneralWebApi.Application.Features.Positions.Commands;
using GeneralWebApi.Application.Features.Positions.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Position;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Business;

public class PositionsController : BaseController
{
    private readonly IMediator _mediator;

    public PositionsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<PositionListDto>>>> GetPositions([FromQuery] PositionSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var query = new GetPositionsQuery { PositionSearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<PositionListDto>>.SuccessResult(result, "Positions retrieved successfully"));
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<PositionDto>>> GetPosition(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetPositionByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PositionDto>.SuccessResult(result, "Position retrieved successfully"));
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<PositionDto>>> CreatePosition([FromBody] CreatePositionDto createDto)
    {
        return await ValidateAndExecuteAsync(createDto, async (validatedDto) =>
        {
            var command = new CreatePositionCommand { CreatePositionDto = validatedDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetPosition), new { id = result.Id },
                ApiResponse<PositionDto>.SuccessResult(result, "Position created successfully"));
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<PositionDto>>> UpdatePosition([FromBody] UpdatePositionDto updateDto)
    {
        return await ValidateAndExecuteAsync(updateDto, async (validatedDto) =>
        {
            var command = new UpdatePositionCommand { UpdatePositionDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<PositionDto>.SuccessResult(result, "Position updated successfully"));
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<PositionDto>>> DeletePosition(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeletePositionCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<PositionDto>.SuccessResult(result, "Position deleted successfully"));
        });
    }

    [HttpGet("department/{departmentId}")]
    public async Task<ActionResult<ApiResponse<List<PositionDto>>>> GetPositionsByDepartment(int departmentId)
    {
        return await ValidateAndExecuteAsync(departmentId, async (validatedId) =>
        {
            var query = new GetPositionsByDepartmentQuery { DepartmentId = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<PositionDto>>.SuccessResult(result, "Department positions retrieved successfully"));
        });
    }
}

