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
    /// <returns>True if assignment was successful, otherwise false</returns>
    public static bool AssignManager(int departmentId, int managerId, ICollection<Employee> employees)
    {
        // Find the manager employee
        var manager = employees.FirstOrDefault(e => e.Id == managerId);
        if (manager == null)
            return false;

        // Check if manager is in the same department
        if (manager.DepartmentId != departmentId)
            return false;

        // Remove existing manager from the department
        var existingManager = employees.FirstOrDefault(e => e.DepartmentId == departmentId && e.IsManager);
        if (existingManager != null)
        {
            existingManager.IsManager = false;
        }

        // Assign new manager
        manager.IsManager = true;
        return true;
    }

    /// <summary>
    /// Remove manager from a department
    /// </summary>
    /// <param name="departmentId">The department ID</param>
    /// <param name="employees">Collection of employees</param>
    /// <returns>True if removal was successful, otherwise false</returns>
    public static bool RemoveManager(int departmentId, ICollection<Employee> employees)
    {
        var manager = employees.FirstOrDefault(e => e.DepartmentId == departmentId && e.IsManager);
        if (manager == null)
            return false;

        manager.IsManager = false;
        return true;
    }

    /// <summary>
    /// Get the manager of a department
    /// </summary>
    /// <param name="departmentId">The department ID</param>
    /// <param name="employees">Collection of employees</param>
    /// <returns>The department manager if exists, otherwise null</returns>
    public static Employee? GetManager(int departmentId, ICollection<Employee> employees)
    {
        return employees.FirstOrDefault(e => e.DepartmentId == departmentId && e.IsManager);
    }

    /// <summary>
    /// Check if a department has a manager
    /// </summary>
    /// <param name="departmentId">The department ID</param>
    /// <param name="employees">Collection of employees</param>
    /// <returns>True if department has a manager, otherwise false</returns>
    public static bool HasManager(int departmentId, ICollection<Employee> employees)
    {
        return employees.Any(e => e.DepartmentId == departmentId && e.IsManager);
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
