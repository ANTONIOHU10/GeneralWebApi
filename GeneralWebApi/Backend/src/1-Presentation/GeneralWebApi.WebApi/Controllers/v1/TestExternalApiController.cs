using System.Text;
using GeneralWebApi.Controllers.Base;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.Controllers.v1;

[ApiController]
[Route("api/v1/[controller]")]
[ApiVersion("1.0")]

public class TestExternalApiController : ControllerBase
{
    [HttpGet("user-info")]
    public IActionResult GetUserInfo()
    {
        // get the authorization header
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();

        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Basic "))
        {
            return Unauthorized(new { message = "Basic authentication required" });
        }

        try
        {
            // decode the base64 credentials
            var encodedCredentials = authHeader.Substring("Basic ".Length);
            var credentials = Encoding.UTF8.GetString(Convert.FromBase64String(encodedCredentials));
            var parts = credentials.Split(':');

            if (parts.Length != 2)
            {
                return Unauthorized(new { message = "Invalid authentication format" });
            }

            var username = parts[0];
            var password = parts[1];

            // validate the credentials
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
        catch
        {
            return Unauthorized(new { message = "Invalid authentication credentials" });
        }
    }
}