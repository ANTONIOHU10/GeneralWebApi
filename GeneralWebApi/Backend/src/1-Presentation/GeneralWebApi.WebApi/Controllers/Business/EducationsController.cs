using GeneralWebApi.Application.Features.Education.Commands;
using GeneralWebApi.Application.Features.Education.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Education;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Business;

public class EducationsController : BaseController
{
    private readonly IMediator _mediator;

    public EducationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<EducationListDto>>>> GetEducations([FromQuery] EducationSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var query = new GetEducationsQuery { EducationSearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<EducationListDto>>.SuccessResult(result, "Education records retrieved successfully"));
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<EducationDto>>> GetEducation(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetEducationByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<EducationDto>.SuccessResult(result, "Education record retrieved successfully"));
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<EducationDto>>> CreateEducation([FromBody] CreateEducationDto createDto)
    {
        return await ValidateAndExecuteAsync(createDto, async (validatedDto) =>
        {
            var command = new CreateEducationCommand { CreateEducationDto = validatedDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetEducation), new { id = result.Id },
                ApiResponse<EducationDto>.SuccessResult(result, "Education record created successfully"));
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<EducationDto>>> UpdateEducation([FromBody] UpdateEducationDto updateDto)
    {
        return await ValidateAndExecuteAsync(updateDto, async (validatedDto) =>
        {
            var command = new UpdateEducationCommand { UpdateEducationDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<EducationDto>.SuccessResult(result, "Education record updated successfully"));
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<EducationDto>>> DeleteEducation(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteEducationCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<EducationDto>.SuccessResult(result, "Education record deleted successfully"));
        });
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<EducationListDto>>>> GetEducationsByEmployee(int employeeId)
    {
        return await ValidateAndExecuteAsync(employeeId, async (validatedId) =>
        {
            var query = new GetEducationsByEmployeeIdQuery { EmployeeId = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<IEnumerable<EducationListDto>>.SuccessResult(result, "Employee education records retrieved successfully"));
        });
    }
}



