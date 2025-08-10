using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Repository;
using Microsoft.AspNetCore.Mvc;
using GeneralWebApi.HttpClient.Services;

namespace GeneralWebApi.WebApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
[ApiVersion("1.0")]
public class ExternalApiController : BaseController
{
    private readonly IExternalApiConfigRepository _configRepository;
    private readonly IExternalHttpClientService _externalHttpClientService;

    public ExternalApiController(
        IExternalApiConfigRepository configRepository,
        IExternalHttpClientService externalHttpClientService)
    {
        _configRepository = configRepository;
        _externalHttpClientService = externalHttpClientService;
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
    public async Task<ActionResult<ApiResponse<IEnumerable<ExternalApiConfig>>>> GetAllAsync(CancellationToken cancellationToken)
    {
        var items = await _configRepository.GetAllAsync(cancellationToken);
        return Success(items, "Fetched external API configs successfully");
    }

    // GET: api/v1/externalapi/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ExternalApiConfig>>> GetByIdAsync([FromRoute] int id, CancellationToken cancellationToken)
    {
        try
        {
            var item = await _configRepository.GetByIdAsync(id, cancellationToken);
            return Success(item, "Fetched external API config successfully");
        }
        catch (Exception)
        {
            return NotFound<ExternalApiConfig>("ExternalApiConfig not found");
        }
    }

    // GET: api/v1/externalapi/by-name/{name}
    [HttpGet("by-name/{name}")]
    public async Task<ActionResult<ApiResponse<ExternalApiConfig>>> GetByNameAsync([FromRoute] string name, CancellationToken cancellationToken)
    {
        var item = await _configRepository.GetByNameAsync(name, cancellationToken);
        if (item == null)
        {
            return NotFound<ExternalApiConfig>("ExternalApiConfig not found");
        }
        return Success(item, "Fetched external API config successfully");
    }

    // POST: api/v1/externalapi
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ExternalApiConfig>>> CreateAsync([FromBody] ExternalApiConfig request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name) || string.IsNullOrWhiteSpace(request.BaseUrl))
        {
            return BadRequest<ExternalApiConfig>("Name and BaseUrl are required");
        }

        request.Id = 0;
        request.CreatedAt = DateTime.UtcNow;
        request.UpdatedAt = null;
        request.IsActive = true;

        var created = await _configRepository.AddAsync(request, cancellationToken);
        return Success(created, "Created external API config successfully");
    }

    // PUT: api/v1/externalapi/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<ExternalApiConfig>>> UpdateAsync([FromRoute] int id, [FromBody] ExternalApiConfig request, CancellationToken cancellationToken)
    {
        try
        {
            var existing = await _configRepository.GetByIdAsync(id, cancellationToken);

            // Update fields
            existing.Name = request.Name;
            existing.BaseUrl = request.BaseUrl;
            existing.ApiKey = request.ApiKey;
            existing.AuthToken = request.AuthToken;
            existing.Username = request.Username;
            existing.Password = request.Password;
            existing.ClientId = request.ClientId;
            existing.ClientSecret = request.ClientSecret;
            existing.Endpoint = request.Endpoint;
            existing.HttpMethod = request.HttpMethod;
            existing.Headers = request.Headers;
            existing.TimeoutSeconds = request.TimeoutSeconds;
            existing.Description = request.Description;
            existing.Category = request.Category;
            existing.IsActive = request.IsActive;
            existing.Remarks = request.Remarks;
            existing.SortOrder = request.SortOrder;
            existing.UpdatedAt = DateTime.UtcNow;

            var updated = await _configRepository.UpdateAsync(existing, cancellationToken);
            return Success(updated, "Updated external API config successfully");
        }
        catch (Exception)
        {
            return NotFound<ExternalApiConfig>("ExternalApiConfig not found");
        }
    }

    // DELETE: api/v1/externalapi/5
    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<ExternalApiConfig>>> DeleteAsync([FromRoute] int id, CancellationToken cancellationToken)
    {
        try
        {
            var deleted = await _configRepository.DeleteAsync(id, cancellationToken);
            return Success(deleted, "Deleted external API config successfully");
        }
        catch (Exception)
        {
            return NotFound<ExternalApiConfig>("ExternalApiConfig not found");
        }
    }

    #endregion
}