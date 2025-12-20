using MediatR;

namespace GeneralWebApi.Application.Features.Notifications.Queries;

/// <summary>
/// Query for getting unread notification count
/// </summary>
public class GetUnreadCountQuery : IRequest<int>
{
}

