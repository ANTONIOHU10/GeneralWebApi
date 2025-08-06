using System.Text.Json.Serialization;

namespace GeneralWebApi.Application.Common.Models;

/// <summary>
/// Generic service result wrapper for operations that return data
/// </summary>
/// <typeparam name="T">The type of data being returned</typeparam>
public class ServiceResult<T>
{
    [JsonPropertyName("isSuccess")]
    public bool IsSuccess { get; }

    [JsonPropertyName("data")]
    public T? Data { get; }

    [JsonPropertyName("errorMessage")]
    public string? ErrorMessage { get; }

    [JsonPropertyName("errorCode")]
    public string? ErrorCode { get; }

    [JsonPropertyName("errors")]
    public List<string> Errors { get; }

    private ServiceResult(bool isSuccess, T? data, string? errorMessage, string? errorCode, List<string> errors)
    {
        IsSuccess = isSuccess;
        Data = data;
        ErrorMessage = errorMessage;
        ErrorCode = errorCode;
        Errors = errors ?? new List<string>();
    }

    // Success methods
    public static ServiceResult<T> Success(T data) => new(true, data, null, null, new());

    // Failure methods
    public static ServiceResult<T> Failure(string errorMessage, string? errorCode = null)
        => new(false, default, errorMessage, errorCode, new());

    public static ServiceResult<T> Failure(List<string> errors, string? errorCode = null)
        => new(false, default, null, errorCode, errors);

    public static ServiceResult<T> Failure(string errorMessage, string errorCode, List<string> errors)
        => new(false, default, errorMessage, errorCode, errors);

    // Implicit conversion from T to ServiceResult<T>
    public static implicit operator ServiceResult<T>(T data) => Success(data);
}

/// <summary>
/// Service result for operations that don't return data
/// </summary>
public class ServiceResult
{
    [JsonPropertyName("isSuccess")]
    public bool IsSuccess { get; }

    [JsonPropertyName("errorMessage")]
    public string? ErrorMessage { get; }

    [JsonPropertyName("errorCode")]
    public string? ErrorCode { get; }

    [JsonPropertyName("errors")]
    public List<string> Errors { get; }

    private ServiceResult(bool isSuccess, string? errorMessage, string? errorCode, List<string> errors)
    {
        IsSuccess = isSuccess;
        ErrorMessage = errorMessage;
        ErrorCode = errorCode;
        Errors = errors ?? new List<string>();
    }

    // Success methods
    public static ServiceResult Success() => new(true, null, null, new());

    // Failure methods
    public static ServiceResult Failure(string errorMessage, string? errorCode = null)
        => new(false, errorMessage, errorCode, new());

    public static ServiceResult Failure(List<string> errors, string? errorCode = null)
        => new(false, null, errorCode, errors);

    public static ServiceResult Failure(string errorMessage, string errorCode, List<string> errors)
        => new(false, errorMessage, errorCode, errors);
}