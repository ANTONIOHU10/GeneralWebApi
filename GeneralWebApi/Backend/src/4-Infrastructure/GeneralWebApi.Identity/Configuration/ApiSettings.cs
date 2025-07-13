namespace GeneralWebApi.Identity.Configuration;

public class ApiKeySettings
{
    public string HeaderName { get; set; } = "X-API-Key";
    public Dictionary<string, string> ValidApiKeys { get; set; } = new();
}