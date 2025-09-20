using GeneralWebApi.Application.Features.IdentityDocument.Commands;
using GeneralWebApi.Application.Features.IdentityDocument.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.IdentityDocument;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.Business;

public class IdentityDocumentsController : BaseController
{
    private readonly IMediator _mediator;

    public IdentityDocumentsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<IdentityDocumentListDto>>>> GetIdentityDocuments([FromQuery] IdentityDocumentSearchDto searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto, async (validatedDto) =>
        {
            var query = new GetIdentityDocumentsQuery { IdentityDocumentSearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<IdentityDocumentListDto>>.SuccessResult(result, "Identity document records retrieved successfully"));
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<IdentityDocumentDto>>> GetIdentityDocument(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetIdentityDocumentByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<IdentityDocumentDto>.SuccessResult(result, "Identity document record retrieved successfully"));
        });
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<IdentityDocumentDto>>> CreateIdentityDocument([FromBody] CreateIdentityDocumentDto createDto)
    {
        return await ValidateAndExecuteAsync(createDto, async (validatedDto) =>
        {
            var command = new CreateIdentityDocumentCommand { CreateIdentityDocumentDto = validatedDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetIdentityDocument), new { id = result.Id },
                ApiResponse<IdentityDocumentDto>.SuccessResult(result, "Identity document record created successfully"));
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<IdentityDocumentDto>>> UpdateIdentityDocument([FromBody] UpdateIdentityDocumentDto updateDto)
    {
        return await ValidateAndExecuteAsync(updateDto, async (validatedDto) =>
        {
            var command = new UpdateIdentityDocumentCommand { UpdateIdentityDocumentDto = validatedDto };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<IdentityDocumentDto>.SuccessResult(result, "Identity document record updated successfully"));
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<IdentityDocumentDto>>> DeleteIdentityDocument(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteIdentityDocumentCommand { Id = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<IdentityDocumentDto>.SuccessResult(result, "Identity document record deleted successfully"));
        });
    }

    [HttpGet("employee/{employeeId}")]
    public async Task<ActionResult<ApiResponse<IEnumerable<IdentityDocumentListDto>>>> GetIdentityDocumentsByEmployee(int employeeId)
    {
        return await ValidateAndExecuteAsync(employeeId, async (validatedId) =>
        {
            var query = new GetIdentityDocumentsByEmployeeIdQuery { EmployeeId = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<IEnumerable<IdentityDocumentListDto>>.SuccessResult(result, "Employee identity document records retrieved successfully"));
        });
    }

    [HttpGet("expiring")]
    public async Task<ActionResult<ApiResponse<IEnumerable<IdentityDocumentListDto>>>> GetExpiringIdentityDocuments([FromQuery] int daysFromNow = 30)
    {
        return await ValidateAndExecuteAsync(daysFromNow, async (validatedDays) =>
        {
            var query = new GetExpiringIdentityDocumentsQuery { DaysFromNow = validatedDays };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<IEnumerable<IdentityDocumentListDto>>.SuccessResult(result, "Expiring identity document records retrieved successfully"));
        });
    }

    [HttpGet("expired")]
    public async Task<ActionResult<ApiResponse<IEnumerable<IdentityDocumentListDto>>>> GetExpiredIdentityDocuments()
    {
        return await ValidateAndExecuteAsync(new object(), async (_) =>
        {
            var query = new GetExpiredIdentityDocumentsQuery();
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<IEnumerable<IdentityDocumentListDto>>.SuccessResult(result, "Expired identity document records retrieved successfully"));
        });
    }
}

