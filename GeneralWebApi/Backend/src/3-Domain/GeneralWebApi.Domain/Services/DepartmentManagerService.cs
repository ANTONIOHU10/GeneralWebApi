using GeneralWebApi.Domain.Entities.Anagraphy;

namespace GeneralWebApi.Domain.Services;

/// <summary>
/// Service for managing department managers
/// </summary>
public class DepartmentManagerService
{
    /// <summary>
    /// Assign a manager to a department
    /// </summary>
    /// <param name="departmentId">The department ID</param>
    /// <param name="managerId">The manager employee ID</param>
    /// <param name="employees">Collection of employees</param>
    /// <param name="managerRole">The management role (default: "Manager")</param>
    /// <returns>True if assignment was successful, otherwise false</returns>
    public static bool AssignManager(int departmentId, int managerId, ICollection<Employee> employees, string managerRole = "Manager")
    {
        // Find the manager employee
        var manager = employees.FirstOrDefault(e => e.Id == managerId);
        if (manager == null)
            return false;

        // Check if manager is in the same department
        if (manager.DepartmentId != departmentId)
            return false;

        // If assigning as primary Manager, remove existing primary manager (only one primary manager per department)
        if (managerRole == "Manager")
        {
            var existingPrimaryManager = employees.FirstOrDefault(e => e.DepartmentId == departmentId && e.ManagerRole == "Manager");
            if (existingPrimaryManager != null && existingPrimaryManager.Id != managerId)
            {
                existingPrimaryManager.IsManager = false;
                existingPrimaryManager.ManagerRole = "None";
            }
        }

        // Assign new manager
        manager.IsManager = true;
        manager.ManagerRole = managerRole;
        return true;
    }

    /// <summary>
    /// Remove manager from a department
    /// </summary>
    /// <param name="departmentId">The department ID</param>
    /// <param name="employees">Collection of employees</param>
    /// <param name="managerId">Optional: specific manager ID to remove. If null, removes primary manager.</param>
    /// <returns>True if removal was successful, otherwise false</returns>
    public static bool RemoveManager(int departmentId, ICollection<Employee> employees, int? managerId = null)
    {
        Employee? manager;
        
        if (managerId.HasValue)
        {
            manager = employees.FirstOrDefault(e => e.Id == managerId.Value && e.DepartmentId == departmentId && e.IsManager);
        }
        else
        {
            // Remove primary manager by default
            manager = employees.FirstOrDefault(e => e.DepartmentId == departmentId && e.ManagerRole == "Manager");
        }
        
        if (manager == null)
            return false;

        manager.IsManager = false;
        manager.ManagerRole = "None";
        return true;
    }

    /// <summary>
    /// Get the primary manager of a department
    /// </summary>
    /// <param name="departmentId">The department ID</param>
    /// <param name="employees">Collection of employees</param>
    /// <returns>The primary department manager if exists, otherwise null</returns>
    public static Employee? GetManager(int departmentId, ICollection<Employee> employees)
    {
        return employees.FirstOrDefault(e => e.DepartmentId == departmentId && e.ManagerRole == "Manager");
    }

    /// <summary>
    /// Get all managers of a department (including all management roles)
    /// </summary>
    /// <param name="departmentId">The department ID</param>
    /// <param name="employees">Collection of employees</param>
    /// <returns>List of all managers in the department</returns>
    public static List<Employee> GetAllManagers(int departmentId, ICollection<Employee> employees)
    {
        return employees
            .Where(e => e.DepartmentId == departmentId && e.IsManager && e.ManagerRole != "None")
            .OrderBy(e => e.ManagerRole == "Manager" ? 0 : 1)  // Primary manager first
            .ThenBy(e => e.ManagerRole)
            .ToList();
    }

    /// <summary>
    /// Check if a department has a manager
    /// </summary>
    /// <param name="departmentId">The department ID</param>
    /// <param name="employees">Collection of employees</param>
    /// <param name="managerRole">Optional: specific role to check. If null, checks for any manager.</param>
    /// <returns>True if department has a manager, otherwise false</returns>
    public static bool HasManager(int departmentId, ICollection<Employee> employees, string? managerRole = null)
    {
        if (managerRole != null)
        {
            return employees.Any(e => e.DepartmentId == departmentId && e.ManagerRole == managerRole);
        }
        return employees.Any(e => e.DepartmentId == departmentId && e.IsManager && e.ManagerRole != "None");
    }

    /// <summary>
    /// Validate if an employee can be assigned as manager
    /// </summary>
    /// <param name="employeeId">The employee ID</param>
    /// <param name="departmentId">The department ID</param>
    /// <param name="employees">Collection of employees</param>
    /// <returns>Validation result with error message if invalid</returns>
    public static (bool IsValid, string? ErrorMessage) ValidateManagerAssignment(
        int employeeId,
        int departmentId,
        ICollection<Employee> employees)
    {
        var employee = employees.FirstOrDefault(e => e.Id == employeeId);
        if (employee == null)
            return (false, "Employee not found");

        if (employee.DepartmentId != departmentId)
            return (false, "Employee must be in the same department to be assigned as manager");

        if (employee.EmploymentStatus != "Active")
            return (false, "Only active employees can be assigned as managers");

        if (employee.TerminationDate.HasValue)
            return (false, "Terminated employees cannot be assigned as managers");

        return (true, null);
    }
}
