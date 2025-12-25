using GeneralWebApi.Application.Features.Notifications.Commands;
using GeneralWebApi.Application.Features.Notifications.Queries;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Controllers.Base;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Notification;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.v1;

/// <summary>
/// Controller for managing notifications
/// All authenticated users can manage their own notifications
/// </summary>
[ApiController]
[Route("api/v1/[controller]")]
[Authorize] // Require authentication for all endpoints
public class NotificationsController : BaseController
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated list of notifications for the current user
    /// </summary>
    /// <param name="searchDto">Search criteria</param>
    /// <returns>Paginated notification list</returns>
    [HttpGet]
    [Authorize(Policy = "AllRoles")]
    public async Task<ActionResult<ApiResponse<PagedResult<NotificationListDto>>>> GetNotifications([FromQuery] NotificationSearchDto? searchDto)
    {
        return await ValidateAndExecuteAsync(searchDto ?? new NotificationSearchDto(), async (validatedDto) =>
        {
            var query = new GetNotificationsQuery { SearchDto = validatedDto };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<PagedResult<NotificationListDto>>.SuccessResult(result, "Notifications retrieved successfully"));
        });
    }

    /// <summary>
    /// Get notification by ID
    /// </summary>
    /// <param name="id">Notification ID</param>
    /// <returns>Notification details</returns>
    [HttpGet("{id}")]
    [Authorize(Policy = "AllRoles")]
    public async Task<ActionResult<ApiResponse<NotificationDto>>> GetNotificationById(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var query = new GetNotificationByIdQuery { Id = validatedId };
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<NotificationDto>.SuccessResult(result, "Notification retrieved successfully"));
        });
    }

    /// <summary>
    /// Get unread notification count for the current user
    /// </summary>
    /// <returns>Unread count</returns>
    [HttpGet("unread-count")]
    [Authorize(Policy = "AllRoles")]
    public async Task<ActionResult<ApiResponse<int>>> GetUnreadCount()
    {
        return await ValidateAndExecuteAsync(new object(), async (_) =>
        {
            var query = new GetUnreadCountQuery();
            var result = await _mediator.Send(query);
            return Ok(ApiResponse<int>.SuccessResult(result, "Unread count retrieved successfully"));
        });
    }

    /// <summary>
    /// Create a new notification
    /// </summary>
    /// <param name="createDto">Notification data</param>
    /// <returns>Created notification</returns>
    [HttpPost]
    [Authorize(Policy = "AllRoles")]
    public async Task<ActionResult<ApiResponse<NotificationDto>>> CreateNotification([FromBody] CreateNotificationDto createDto)
    {
        return await ValidateAndExecuteAsync(createDto, async (validatedDto) =>
        {
            var command = new CreateNotificationCommand { CreateNotificationDto = validatedDto };
            var result = await _mediator.Send(command);
            return CreatedAtAction(
                nameof(GetNotificationById),
                new { id = result.Id },
                ApiResponse<NotificationDto>.SuccessResult(result, "Notification created successfully"));
        });
    }

    /// <summary>
    /// Toggle notification read status (read <-> unread)
    /// </summary>
    /// <param name="id">Notification ID</param>
    /// <returns>Success response</returns>
    [HttpPost("{id}/toggle-read-status")]
    [Authorize(Policy = "AllRoles")]
    public async Task<ActionResult<ApiResponse<object>>> ToggleReadStatus(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new ToggleReadStatusCommand { NotificationId = validatedId };
            await _mediator.Send(command);
            return Ok(ApiResponse<object>.SuccessResult(null, "Notification read status toggled successfully"));
        });
    }

    /// <summary>
    /// Mark all notifications as read for the current user
    /// </summary>
    /// <returns>Success response</returns>
    [HttpPost("mark-all-read")]
    [Authorize(Policy = "AllRoles")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAllAsRead()
    {
        return await ValidateAndExecuteAsync(new object(), async (_) =>
        {
            var command = new MarkAllAsReadCommand();
            await _mediator.Send(command);
            return Ok(ApiResponse<object>.SuccessResult(null, "All notifications marked as read successfully"));
        });
    }

    /// <summary>
    /// Mark notification as archived
    /// </summary>
    /// <param name="id">Notification ID</param>
    /// <returns>Success response</returns>
    [HttpPost("{id}/archive")]
    [Authorize(Policy = "AllRoles")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsArchived(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new MarkAsArchivedCommand { NotificationId = validatedId };
            await _mediator.Send(command);
            return Ok(ApiResponse<object>.SuccessResult(null, "Notification archived successfully"));
        });
    }

    /// <summary>
    /// Delete notification
    /// </summary>
    /// <param name="id">Notification ID</param>
    /// <returns>Success response</returns>
    [HttpDelete("{id}")]
    [Authorize(Policy = "AllRoles")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteNotification(int id)
    {
        return await ValidateAndExecuteAsync(id, async (validatedId) =>
        {
            var command = new DeleteNotificationCommand { NotificationId = validatedId };
            var result = await _mediator.Send(command);
            return Ok(ApiResponse<object>.SuccessResult(null, "Notification deleted successfully"));
        });
    }
}

