using GeneralWebApi.Application.Features.Departments.Commands;
using GeneralWebApi.Application.Features.Departments.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Department;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Business;

public class DepartmentsController : BaseController
{
    private readonly IMediator _mediator;

    public DepartmentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<DepartmentListDto>>>> GetDepartments([FromQuery] DepartmentSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var query = new GetDepartmentsQuery { DepartmentSearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<DepartmentListDto>>.SuccessResult(result, "Departments retrieved successfully"));
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> GetDepartment(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetDepartmentByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<DepartmentDto>.SuccessResult(result, "Department retrieved successfully"));
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> CreateDepartment([FromBody] CreateDepartmentDto createDto)
    {
        return await ValidateAndExecuteAsync(createDto, async (validatedDto) =>
        {
            var command = new CreateDepartmentCommand { CreateDepartmentDto = validatedDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetDepartment), new { id = result.Id },
                ApiResponse<DepartmentDto>.SuccessResult(result, "Department created successfully"));
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> UpdateDepartment([FromBody] UpdateDepartmentDto updateDto)
    {
        return await ValidateAndExecuteAsync(updateDto, async (validatedDto) =>
        {
            var command = new UpdateDepartmentCommand { UpdateDepartmentDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<DepartmentDto>.SuccessResult(result, "Department updated successfully"));
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<DepartmentDto>>> DeleteDepartment(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteDepartmentCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<DepartmentDto>.SuccessResult(result, "Department deleted successfully"));
        });
    }

    [HttpGet("hierarchy")]
    public async Task<ActionResult<ApiResponse<List<DepartmentDto>>>> GetDepartmentHierarchy()
    {
        var query = new GetDepartmentHierarchyQuery();
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<List<DepartmentDto>>.SuccessResult(result, "Department hierarchy retrieved successfully"));
    }

    [HttpGet("parent/{parentId}")]
    public async Task<ActionResult<ApiResponse<List<DepartmentDto>>>> GetDepartmentsByParent(int parentId)
    {
        return await ValidateAndExecuteAsync(parentId, async (validatedId) =>
        {
            var query = new GetDepartmentsByParentQuery { ParentId = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<List<DepartmentDto>>.SuccessResult(result, "Department children retrieved successfully"));
        });
    }
}

