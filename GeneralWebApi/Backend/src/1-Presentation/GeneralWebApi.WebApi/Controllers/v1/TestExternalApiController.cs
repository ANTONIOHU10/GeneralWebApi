using GeneralWebApi.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
[ApiVersion("1.0")]

public class TestExternalApiController : ControllerBase
{
    [HttpGet("user-info")]
    public IActionResult GetUserInfo([FromQuery] string username, [FromQuery] string password)
    {
        // create a mock username & password to be used for third party caller
        if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
        {
            return Unauthorized(new { message = "Username and password are required" });
        }

        // validate the username & password
        if (username != "test" || password != "test123456")
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        // return the user info

        return Ok(new[]
        {
            new { userId = 1, firstName = "John", lastName = "Doe", email = "john@doe.com" },
            new { userId = 2, firstName = "Jane", lastName = "Doe", email = "jane@doe.com" }
        });
    }
}