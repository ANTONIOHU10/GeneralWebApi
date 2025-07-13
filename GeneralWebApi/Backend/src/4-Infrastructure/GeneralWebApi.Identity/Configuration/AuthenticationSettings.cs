namespace GeneralWebApi.Identity.Configuration;

public class AuthenticationSettings
{
    public bool EnableJwt { get; set; } = true;
    public bool EnableApiKey { get; set; } = true;
    public bool EnableOAuth { get; set; } = false;

    // default authentication scheme， scheme = the protocol used to authenticate the request
    public string DefaultScheme { get; set; } = "Bearer";

    // use the jwt settings and api key settings to authenticate the request
    public JwtSettings Jwt { get; set; } = new();
    public ApiKeySettings ApiKey { get; set; } = new();
}