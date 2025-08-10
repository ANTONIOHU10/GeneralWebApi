using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Repository;
using Microsoft.AspNetCore.Mvc;
using GeneralWebApi.HttpClient.Services;
using GeneralWebApi.Contracts.Requests;
using GeneralWebApi.Contracts.Responses;
using AutoMapper;

namespace GeneralWebApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
[ApiVersion("1.0")]
public class ExternalApiController : BaseController
{
    private readonly IExternalApiConfigRepository _configRepository;
    private readonly IExternalHttpClientService _externalHttpClientService;
    private readonly IMapper _mapper;

    public ExternalApiController(
        IExternalApiConfigRepository configRepository,
        IExternalHttpClientService externalHttpClientService,
        IMapper mapper)
    {
        _configRepository = configRepository;
        _externalHttpClientService = externalHttpClientService;
        _mapper = mapper;
    }

    #region call external API

    [HttpGet("call-external-api")]
    public async Task<ActionResult> CallExternalApiAsync(CancellationToken cancellationToken)
    {
        try
        {
            // get the config from the database
            var config = await _configRepository.GetByNameAsync("TestExternalApi", cancellationToken);
            if (config == null)
            {
                return NotFound("External API config not found");
            }

            // call the external API
            var response = await _externalHttpClientService.GetAsync(config.Name, cancellationToken: cancellationToken);

            if (response.IsSuccess)
            {
                // return the response
                return Ok(response.Data);
            }
            else
            {
                // return the error message
                return BadRequest($"External API call failed: {response.ErrorMessage}");
            }
        }
        catch (Exception ex)
        {
            return BadRequest($"Failed to call external API: {ex.Message}");
        }
    }

    #endregion

    #region CRUD Operations

    // GET: api/v1/externalapi
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<ExternalApiConfigResponse>>>> GetAllAsync(CancellationToken cancellationToken)
    {
        var items = await _configRepository.GetAllAsync(cancellationToken);
        var responseDtos = _mapper.Map<IEnumerable<ExternalApiConfigResponse>>(items);
        return Success(responseDtos, "Fetched external API configs successfully");
    }

    // GET: api/v1/externalapi/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ExternalApiConfigResponse>>> GetByIdAsync([FromRoute] int id, CancellationToken cancellationToken)
    {
        try
        {
            var item = await _configRepository.GetByIdAsync(id, cancellationToken);
            if (item == null)
            {
                return NotFound<ExternalApiConfigResponse>("ExternalApiConfig not found");
            }

            var responseDto = _mapper.Map<ExternalApiConfigResponse>(item);
            return Success(responseDto, "Fetched external API config successfully");
        }
        catch (Exception)
        {
            return NotFound<ExternalApiConfigResponse>("ExternalApiConfig not found");
        }
    }

    // GET: api/v1/externalapi/by-name/{name}
    [HttpGet("by-name/{name}")]
    public async Task<ActionResult<ApiResponse<ExternalApiConfigResponse>>> GetByNameAsync([FromRoute] string name, CancellationToken cancellationToken)
    {
        var item = await _configRepository.GetByNameAsync(name, cancellationToken);
        if (item == null)
        {
            return NotFound<ExternalApiConfigResponse>("ExternalApiConfig not found");
        }

        var responseDto = _mapper.Map<ExternalApiConfigResponse>(item);
        return Success(responseDto, "Fetched external API config successfully");
    }

    // POST: api/v1/externalapi
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ExternalApiConfigResponse>>> CreateAsync(
        [FromBody] ExternalApiConfigRequest request,
        CancellationToken cancellationToken)
    {
        return await ValidateAndExecuteAsync(request, async (req) =>
        {
            // check if name already exists
            var existingConfig = await _configRepository.GetByNameAsync(req.Name, cancellationToken);
            if (existingConfig != null)
            {
                return BadRequest(ApiResponse<ExternalApiConfigResponse>.ErrorResult($"External API config with name '{req.Name}' already exists"));
            }

            // map to Domain Entity using AutoMapper
            var config = _mapper.Map<ExternalApiConfig>(req);

            var created = await _configRepository.AddAsync(config, cancellationToken);
            var responseDto = _mapper.Map<ExternalApiConfigResponse>(created);
            return Ok(ApiResponse<ExternalApiConfigResponse>.SuccessResult(responseDto, "Created external API config successfully"));
        });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ExternalApiConfigResponse>>> UpdateAsync(
        int id,
        [FromBody] ExternalApiConfigRequest request,
        CancellationToken cancellationToken)
    {
        return await ValidateAndExecuteAsync(request, async (req) =>
        {
            // check if config exists
            var existingConfig = await _configRepository.GetByIdAsync(id, cancellationToken);
            if (existingConfig == null)
            {
                return NotFound(ApiResponse<ExternalApiConfigResponse>.ErrorResult($"External API config with ID {id} not found"));
            }

            // check if name already exists
            var configWithSameName = await _configRepository.GetByNameAsync(req.Name, cancellationToken);
            if (configWithSameName != null && configWithSameName.Id != id)
            {
                return BadRequest(ApiResponse<ExternalApiConfigResponse>.ErrorResult($"External API config with name '{req.Name}' already exists"));
            }

            // update config using AutoMapper
            _mapper.Map(req, existingConfig);

            var updated = await _configRepository.UpdateAsync(existingConfig, cancellationToken);
            var responseDto = _mapper.Map<ExternalApiConfigResponse>(updated);
            return Ok(ApiResponse<ExternalApiConfigResponse>.SuccessResult(responseDto, "Updated external API config successfully"));
        });
    }

    // DELETE: api/v1/externalapi/5
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<ExternalApiConfigResponse>>> DeleteAsync([FromRoute] int id, CancellationToken cancellationToken)
    {
        try
        {
            var deleted = await _configRepository.DeleteAsync(id, cancellationToken);
            var responseDto = _mapper.Map<ExternalApiConfigResponse>(deleted);
            return Success(responseDto, "Deleted external API config successfully");
        }
        catch (Exception)
        {
            return NotFound<ExternalApiConfigResponse>("ExternalApiConfig not found");
        }
    }

    #endregion
}