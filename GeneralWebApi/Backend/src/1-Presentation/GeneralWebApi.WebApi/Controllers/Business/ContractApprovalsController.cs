using System.Security.Claims;
using GeneralWebApi.Application.Services.Contracts.Approvals;
using GeneralWebApi.Contracts.Common;
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.DTOs.Contracts.Approvals;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GeneralWebApi.WebApi.Controllers.Business;

[ApiController]
[Route("api/v1/contracts")]
[Authorize]
public class ContractApprovalsController : ControllerBase
{
    private readonly IContractApprovalService _approvalService;
    private readonly ILogger<ContractApprovalsController> _logger;

    public ContractApprovalsController(IContractApprovalService approvalService, ILogger<ContractApprovalsController> logger)
    {
        _approvalService = approvalService ?? throw new ArgumentNullException(nameof(approvalService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpPost("{contractId}/submit-approval")]
    public async Task<IActionResult> SubmitForApproval(int contractId, [FromBody] SubmitApprovalRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Unauthorized("User not authenticated"));
            }

            var result = await _approvalService.SubmitForApprovalAsync(contractId, userId, request.Comments, request.ApprovalSteps);
            return Ok(ApiResponse<ContractApprovalDto>.SuccessResult(result, "Contract submitted for approval successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Contract {ContractId} not found for approval submission", contractId);
            return NotFound(ApiResponse<object>.NotFound(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation for contract {ContractId} approval submission", contractId);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting contract {ContractId} for approval", contractId);
            return StatusCode(500, ApiResponse<object>.InternalServerError("An error occurred while submitting the contract for approval"));
        }
    }

    [HttpPut("approvals/{approvalId}/approve")]
    public async Task<IActionResult> Approve(int approvalId, [FromBody] ApprovalActionRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Unauthorized("User not authenticated"));
            }

            var result = await _approvalService.ApproveAsync(approvalId, userId, request.Comments);
            return Ok(ApiResponse<bool>.SuccessResult(result, "Contract approved successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Approval {ApprovalId} not found for approval", approvalId);
            return NotFound(ApiResponse<object>.NotFound(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Invalid operation for approval {ApprovalId}", approvalId);
            return BadRequest(ApiResponse<object>.ErrorResult(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error approving approval {ApprovalId}", approvalId);
            return StatusCode(500, ApiResponse<object>.InternalServerError("An error occurred while approving the contract"));
        }
    }

    [HttpPut("approvals/{approvalId}/reject")]
    public async Task<IActionResult> Reject(int approvalId, [FromBody] RejectionActionRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Unauthorized("User not authenticated"));
            }

            var result = await _approvalService.RejectAsync(approvalId, userId, request.Reason);
            return Ok(ApiResponse<bool>.SuccessResult(result, "Contract rejected successfully"));
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Approval {ApprovalId} not found for rejection", approvalId);
            return NotFound(ApiResponse<object>.NotFound(ex.Message));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rejecting approval {ApprovalId}", approvalId);
            return StatusCode(500, ApiResponse<object>.InternalServerError("An error occurred while rejecting the contract"));
        }
    }

    [HttpGet("approvals/pending")]
    public async Task<IActionResult> GetPendingApprovals([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Unauthorized("User not authenticated"));
            }

            // Get user roles from claims
            var userRoles = User.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .ToArray();

            var result = await _approvalService.GetPendingApprovalsAsync(userId, userRoles, pageNumber, pageSize);
            return Ok(ApiResponse<PagedResult<ContractApprovalDto>>.SuccessResult(result, "Pending approvals retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving pending approvals for user");
            return StatusCode(500, ApiResponse<object>.InternalServerError("An error occurred while retrieving pending approvals"));
        }
    }

    [HttpGet("{contractId}/approval-history")]
    public async Task<IActionResult> GetApprovalHistory(int contractId)
    {
        try
        {
            var result = await _approvalService.GetApprovalHistoryAsync(contractId);
            return Ok(ApiResponse<List<ContractApprovalStepDto>>.SuccessResult(result, "Approval history retrieved successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving approval history for contract {ContractId}", contractId);
            return StatusCode(500, ApiResponse<object>.InternalServerError("An error occurred while retrieving approval history"));
        }
    }
}


