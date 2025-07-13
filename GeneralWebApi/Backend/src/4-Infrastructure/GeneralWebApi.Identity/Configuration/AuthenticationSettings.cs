namespace GeneralWebApi.Identity.Configuration;

public class AuthenticationSettings
{
    public bool EnableJwt { get; set; } = true;
    public bool EnableApiKey { get; set; } = true;
    public bool EnableOAuth { get; set; } = false;
    public string DefaultScheme { get; set; } = "Bearer";
    public JwtSettings Jwt { get; set; } = new();
    public ApiKeySettings ApiKey { get; set; } = new();
}