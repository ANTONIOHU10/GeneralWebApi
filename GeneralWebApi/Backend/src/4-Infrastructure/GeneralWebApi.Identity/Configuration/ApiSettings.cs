namespace GeneralWebApi.Identity.Configuration;

public class ApiKeySettings
{
    // custom header name for the api key
    public string HeaderName { get; set; } = "X-API-Key";
    // a dictionary to contain the api keys and their values
    public Dictionary<string, string> ValidApiKeys { get; set; } = new();
}