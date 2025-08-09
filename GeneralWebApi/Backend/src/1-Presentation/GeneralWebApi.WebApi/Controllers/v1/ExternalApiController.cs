using GeneralWebApi.Controllers.Base;
using GeneralWebApi.HttpClient.Models;
using GeneralWebApi.HttpClient.Services;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.v1;
[ApiController]
[Route("api/v1/[controller]")]
[ApiVersion("1.0")]
public class ExternalApiController : BaseController
{

    private readonly IExternalHttpClientService _externalHttpClientService;

    public ExternalApiController(IExternalHttpClientService externalHttpClientService)
    {
        _externalHttpClientService = externalHttpClientService;
    }

    [HttpGet("test")]
    public async Task<ActionResult> Test()
    {
        // TODO: calling API with name "ExternalApiConfig", and pasisng no
        // to be added into DB
        var response = await _externalHttpClientService.GetAsync("ExternalApiConfig");

        // TODO: map the response to the userDTO
        // TODO: return the userDTO as result
        return Ok(response);
    }
}