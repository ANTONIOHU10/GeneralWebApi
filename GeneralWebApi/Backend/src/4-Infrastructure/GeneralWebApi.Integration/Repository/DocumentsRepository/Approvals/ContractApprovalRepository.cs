using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Domain.Entities.Documents.Approvals;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.DocumentsRepository.Approvals;

public class ContractApprovalRepository : BaseRepository<ContractApproval>, IContractApprovalRepository
{
    public ContractApprovalRepository(ApplicationDbContext context, ILogger<BaseRepository<ContractApproval>> logger) : base(context, logger)
    {
    }

    public async Task<ContractApproval?> GetPendingByContractIdAsync(int contractId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(a => a.ApprovalSteps)
            .Include(a => a.Contract)
                .ThenInclude(c => c.Employee)
            .FirstOrDefaultAsync(a => a.ContractId == contractId && a.Status == "Pending", cancellationToken);
    }

    public async Task<ContractApproval?> GetByIdWithStepsAsync(int approvalId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Include(a => a.ApprovalSteps)
            .Include(a => a.Contract)
                .ThenInclude(c => c.Employee)
            .FirstOrDefaultAsync(a => a.Id == approvalId, cancellationToken);
    }

    public async Task<List<ContractApprovalStep>> GetApprovalStepsAsync(int approvalId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<ContractApprovalStep>()
            .Where(s => s.ContractApprovalId == approvalId && !s.IsDeleted)
            .OrderBy(s => s.StepOrder)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<ContractApproval>> GetByContractIdAsync(int contractId, CancellationToken cancellationToken = default)
    {
        return await GetActiveAndEnabledEntities()
            .Where(a => a.ContractId == contractId)
            .ToListAsync(cancellationToken);
    }

    public async Task<PagedResult<ContractApproval>> GetPendingForApproverAsync(string approverUserId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = GetActiveAndEnabledEntities()
            .Include(a => a.ApprovalSteps)
            .Include(a => a.Contract)
                .ThenInclude(c => c.Employee)
            .Where(a => a.Status == "Pending" &&
                a.ApprovalSteps.Any(s => s.Status == "Pending" &&
                    (s.ApproverUserId == approverUserId ||
                     (string.IsNullOrEmpty(s.ApproverUserId) && !string.IsNullOrEmpty(s.ApproverRole)))))
            .AsQueryable();

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ContractApproval>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<PagedResult<ContractApproval>> GetPendingForApproverAsync(string approverUserId, string[] approverRoles, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = GetActiveAndEnabledEntities()
            .Include(a => a.ApprovalSteps)
            .Include(a => a.Contract)
                .ThenInclude(c => c.Employee)
            .Where(a => a.Status == "Pending" &&
                a.ApprovalSteps.Any(s => s.Status == "Pending" &&
                    (s.ApproverUserId == approverUserId ||
                     (string.IsNullOrEmpty(s.ApproverUserId) && !string.IsNullOrEmpty(s.ApproverRole) && approverRoles.Contains(s.ApproverRole)))))
            .AsQueryable();

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<ContractApproval>(items, totalCount, pageNumber, pageSize);
    }
}


