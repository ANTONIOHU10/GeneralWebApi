using GeneralWebApi.Domain.Entities.Base;
using GeneralWebApi.Domain.Entities.Documents;
using GeneralWebApi.Domain.Entities.Permissions;

namespace GeneralWebApi.Domain.Entities.Anagraphy;

public class Employee : BaseEntity
{
    // Employee properties
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public int? DepartmentId { get; set; }
    public int? PositionId { get; set; }
    public int? ManagerId { get; set; }
    public DateTime HireDate { get; set; }
    public DateTime? TerminationDate { get; set; }


    // Personal address
    public string Address { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;

    // Emergency contact
    public string EmergencyContactName { get; set; } = string.Empty;
    public string EmergencyContactPhone { get; set; } = string.Empty;
    public string EmergencyContactRelation { get; set; } = string.Empty;
    public string TaxCode { get; set; } = string.Empty;


    // Salary
    public decimal? CurrentSalary { get; set; }
    public string? SalaryCurrency { get; set; }
    public DateTime? LastSalaryIncreaseDate { get; set; }
    public DateTime? NextSalaryIncreaseDate { get; set; }

    // Status
    public string EmploymentStatus { get; set; } = string.Empty;
    public string EmploymentType { get; set; } = string.Empty;
    public int? WorkingHoursPerWeek { get; set; }
    public bool IsManager { get; set; } = false;


    #region navigation properties

    public Department? Department { get; set; }
    public Position? Position { get; set; }
    public Employee? Manager { get; set; }

    public ICollection<Employee> Subordinates { get; set; } = [];
    public ICollection<Contract> Contracts { get; set; } = [];
    public ICollection<Education> Educations { get; set; } = [];
    public ICollection<Certification> Certifications { get; set; } = [];
    public ICollection<EmployeeRole> EmployeeRoles { get; set; } = [];
    public ICollection<IdentityDocument> IdentityDocuments { get; set; } = [];

    #endregion
}