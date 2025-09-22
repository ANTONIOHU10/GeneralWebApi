using GeneralWebApi.Domain.Entities.Permissions;

namespace GeneralWebApi.Integration.Seeds;

/// <summary>
/// Permission seed data for initial setup
/// </summary>
public static class PermissionSeedData
{
    /// <summary>
    /// Get initial permissions
    /// </summary>
    public static List<Permission> GetInitialPermissions()
    {
        return new List<Permission>
        {
            // Employee Management Permissions
            new Permission
            {
                Name = "Employee.Create",
                Description = "Create new employees",
                Resource = "Employee",
                Action = "Create",
                Category = "EmployeeManagement"
            },
            new Permission
            {
                Name = "Employee.Read",
                Description = "View employee information",
                Resource = "Employee",
                Action = "Read",
                Category = "EmployeeManagement"
            },
            new Permission
            {
                Name = "Employee.Update",
                Description = "Update employee information",
                Resource = "Employee",
                Action = "Update",
                Category = "EmployeeManagement"
            },
            new Permission
            {
                Name = "Employee.Delete",
                Description = "Delete employees",
                Resource = "Employee",
                Action = "Delete",
                Category = "EmployeeManagement"
            },

            // Role Management Permissions
            new Permission
            {
                Name = "Role.Create",
                Description = "Create new roles",
                Resource = "Role",
                Action = "Create",
                Category = "RoleManagement"
            },
            new Permission
            {
                Name = "Role.Read",
                Description = "View role information",
                Resource = "Role",
                Action = "Read",
                Category = "RoleManagement"
            },
            new Permission
            {
                Name = "Role.Update",
                Description = "Update role information",
                Resource = "Role",
                Action = "Update",
                Category = "RoleManagement"
            },
            new Permission
            {
                Name = "Role.Delete",
                Description = "Delete roles",
                Resource = "Role",
                Action = "Delete",
                Category = "RoleManagement"
            },
            new Permission
            {
                Name = "Role.Assign",
                Description = "Assign roles to employees",
                Resource = "Role",
                Action = "Assign",
                Category = "RoleManagement"
            },

            // Permission Management Permissions
            new Permission
            {
                Name = "Permission.Create",
                Description = "Create new permissions",
                Resource = "Permission",
                Action = "Create",
                Category = "PermissionManagement"
            },
            new Permission
            {
                Name = "Permission.Read",
                Description = "View permission information",
                Resource = "Permission",
                Action = "Read",
                Category = "PermissionManagement"
            },
            new Permission
            {
                Name = "Permission.Update",
                Description = "Update permission information",
                Resource = "Permission",
                Action = "Update",
                Category = "PermissionManagement"
            },
            new Permission
            {
                Name = "Permission.Delete",
                Description = "Delete permissions",
                Resource = "Permission",
                Action = "Delete",
                Category = "PermissionManagement"
            },

            // Department Management Permissions
            new Permission
            {
                Name = "Department.Create",
                Description = "Create new departments",
                Resource = "Department",
                Action = "Create",
                Category = "DepartmentManagement"
            },
            new Permission
            {
                Name = "Department.Read",
                Description = "View department information",
                Resource = "Department",
                Action = "Read",
                Category = "DepartmentManagement"
            },
            new Permission
            {
                Name = "Department.Update",
                Description = "Update department information",
                Resource = "Department",
                Action = "Update",
                Category = "DepartmentManagement"
            },
            new Permission
            {
                Name = "Department.Delete",
                Description = "Delete departments",
                Resource = "Department",
                Action = "Delete",
                Category = "DepartmentManagement"
            },

            // Position Management Permissions
            new Permission
            {
                Name = "Position.Create",
                Description = "Create new positions",
                Resource = "Position",
                Action = "Create",
                Category = "PositionManagement"
            },
            new Permission
            {
                Name = "Position.Read",
                Description = "View position information",
                Resource = "Position",
                Action = "Read",
                Category = "PositionManagement"
            },
            new Permission
            {
                Name = "Position.Update",
                Description = "Update position information",
                Resource = "Position",
                Action = "Update",
                Category = "PositionManagement"
            },
            new Permission
            {
                Name = "Position.Delete",
                Description = "Delete positions",
                Resource = "Position",
                Action = "Delete",
                Category = "PositionManagement"
            },

            // System Administration Permissions
            new Permission
            {
                Name = "System.Admin",
                Description = "Full system administration access",
                Resource = "System",
                Action = "Admin",
                Category = "SystemAdministration"
            },
            new Permission
            {
                Name = "System.Config",
                Description = "Configure system settings",
                Resource = "System",
                Action = "Config",
                Category = "SystemAdministration"
            },
            new Permission
            {
                Name = "System.Audit",
                Description = "View system audit logs",
                Resource = "System",
                Action = "Audit",
                Category = "SystemAdministration"
            }
        };
    }

    /// <summary>
    /// Get initial roles
    /// </summary>
    public static List<Role> GetInitialRoles()
    {
        return new List<Role>
        {
            new Role
            {
                Name = "SuperAdmin",
                Description = "Super Administrator with full system access"
            },
            new Role
            {
                Name = "Admin",
                Description = "Administrator with management access"
            },
            new Role
            {
                Name = "HRManager",
                Description = "Human Resources Manager"
            },
            new Role
            {
                Name = "DepartmentManager",
                Description = "Department Manager"
            },
            new Role
            {
                Name = "Employee",
                Description = "Regular Employee"
            },
            new Role
            {
                Name = "ReadOnly",
                Description = "Read-only access user"
            }
        };
    }
}
