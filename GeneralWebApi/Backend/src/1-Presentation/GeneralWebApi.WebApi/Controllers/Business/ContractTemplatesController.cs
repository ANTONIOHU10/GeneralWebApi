using GeneralWebApi.Application.Features.ContractTemplates.Commands;
using GeneralWebApi.Application.Features.ContractTemplates.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.ContractTemplate;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.Business;

/// <summary>
/// Controller for contract template list, get by id, and create.
/// Uses literal route api/v1/contract-templates to match integration tests and avoid versioning issues.
/// </summary>
[ApiController]
[Route("api/v1/contract-templates")]
[Authorize]
public class ContractTemplatesController : ControllerBase
{
    private readonly IMediator _mediator;

    public ContractTemplatesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paged list of contract templates.
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "AllRoles")]
    public async Task<ActionResult<ApiResponse<PagedResult<ContractTemplateListDto>>>> GetContractTemplates([FromQuery] ContractTemplateSearchDto searchDto)
    {
        var query = new GetContractTemplatesQuery { SearchDto = searchDto };
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<PagedResult<ContractTemplateListDto>>.SuccessResult(result, "Contract templates retrieved successfully"));
    }

    /// <summary>
    /// Get contract template by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [Authorize(Policy = "AllRoles")]
    public async Task<ActionResult<ApiResponse<ContractTemplateDto>>> GetContractTemplate(int id)
    {
        if (id <= 0)
            return BadRequest(ApiResponse<ContractTemplateDto>.ErrorResult("ValidationFailed", 400, "Template ID must be greater than 0"));
        var query = new GetContractTemplateByIdQuery { Id = id };
        var result = await _mediator.Send(query);
        return Ok(ApiResponse<ContractTemplateDto>.SuccessResult(result, "Contract template retrieved successfully"));
    }

    /// <summary>
    /// Create a new contract template.
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "ManagerOrAdmin")]
    public async Task<ActionResult<ApiResponse<ContractTemplateDto>>> CreateContractTemplate([FromBody] CreateContractTemplateDto createDto)
    {
        if (createDto == null)
            return BadRequest(ApiResponse<ContractTemplateDto>.ErrorResult("ValidationFailed", 400, "Request body is required"));
        var command = new CreateContractTemplateCommand { CreateDto = createDto };
        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetContractTemplate), new { id = result.Id },
            ApiResponse<ContractTemplateDto>.SuccessResult(result, "Contract template created successfully"));
    }
}
