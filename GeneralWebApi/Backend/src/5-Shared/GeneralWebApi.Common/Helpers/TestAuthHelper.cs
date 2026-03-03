using System.Net;
using System.Net.Http.Json;
using System.Text.Json;

namespace GeneralWebApi.Common.Helpers;

/// <summary>
/// Helper methods for obtaining authentication tokens in tests.
/// Placed in the shared Common project so it can be reused across test projects.
/// </summary>
public static class TestAuthHelper
{
    /// <summary>
    /// Perform a login request against the AuthController and return the access token.
    /// This method does not depend on presentation-layer types to avoid circular references.
    /// </summary>
    /// <param name="client">Configured HttpClient from WebApplicationFactory</param>
    /// <param name="username">Username to login</param>
    /// <param name="password">Password to login</param>
    /// <returns>JWT access token string</returns>
    /// <exception cref="InvalidOperationException">Thrown when login fails or token is missing</exception>
    public static async Task<string> GetAccessTokenAsync(
        System.Net.Http.HttpClient client,
        string username,
        string password)
    {
        var loginPayload = new
        {
            Username = username,
            Password = password,
            RememberMe = false
        };

        var response = await client.PostAsJsonAsync(
            "/api/v1/Auth/login?api-version=1.0",
            loginPayload);

        if (response.StatusCode != HttpStatusCode.OK)
        {
            var body = await response.Content.ReadAsStringAsync();
            throw new InvalidOperationException(
                $"Login failed with status {(int)response.StatusCode}: {body}");
        }

        var json = await response.Content.ReadFromJsonAsync<JsonElement>();

        if (!json.TryGetProperty("data", out var dataElement) ||
            !dataElement.TryGetProperty("token", out var tokenElement) ||
            !tokenElement.TryGetProperty("accessToken", out var accessTokenElement))
        {
            throw new InvalidOperationException("Login response does not contain data.token.accessToken.");
        }

        var token = accessTokenElement.GetString();

        if (string.IsNullOrWhiteSpace(token))
        {
            throw new InvalidOperationException("Access token is null or empty in login response.");
        }

        return token!;
    }
}

