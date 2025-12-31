namespace GeneralWebApi.Domain.Shared.Constants;

/// <summary>
/// Centralized management of all entity enum value constants
/// </summary>
public static class EnumValues
{
    /// <summary>
    /// Contract related enum values
    /// </summary>
    public static class Contract
    {
        public static readonly string[] ContractTypes =
        {
            "Indefinite",    // Indefinite term
            "Fixed",         // Fixed term
            "PartTime",      // Part-time
            "Temporary",     // Temporary
            "Internship",    // Internship
            "Consultant",    // Consultant
            "Freelance",     // Freelance
            "Seasonal"       // Seasonal
        };

        public static readonly string[] Statuses =
        {
            "Active",        // Active
            "Inactive",      // Inactive
            "Expired",       // Expired
            "Terminated",    // Terminated
            "Pending",       // Pending
            "Suspended",     // Suspended
            "Renewed"        // Renewed
        };
    }

    /// <summary>
    /// Certification related enum values
    /// </summary>
    public static class Certification
    {
        public static readonly string[] Types =
        {
            "Professional",  // Professional certification
            "Technical",     // Technical certification
            "Language",      // Language certification
            "Safety",        // Safety certification
            "Industry",      // Industry certification
            "Academic",      // Academic certification
            "Software",      // Software certification
            "Management",    // Management certification
            "Quality",       // Quality certification
            "Compliance"     // Compliance certification
        };

        public static readonly string[] Statuses =
        {
            "Valid",         // Valid
            "Expired",       // Expired
            "Pending",       // Pending
            "Revoked",       // Revoked
            "Suspended",     // Suspended
            "Renewed"        // Renewed
        };
    }

    /// <summary>
    /// Identity document related enum values
    /// </summary>
    public static class IdentityDocument
    {
        public static readonly string[] DocumentTypes =
        {
            "ID",                    // ID card
            "Passport",              // Passport
            "DriverLicense",         // Driver's license
            "SocialSecurity",        // Social security card
            "BirthCertificate",      // Birth certificate
            "MarriageCertificate",   // Marriage certificate
            "DivorceCertificate",    // Divorce certificate
            "WorkPermit",            // Work permit
            "Visa",                  // Visa
            "ResidencePermit"        // Residence permit
        };

        public static readonly string[] Countries =
        {
            "China",         // China
            "United States", // United States
            "United Kingdom", // United Kingdom
            "Germany",       // Germany
            "France",        // France
            "Japan",         // Japan
            "South Korea",   // South Korea
            "Canada",        // Canada
            "Australia",     // Australia
            "Italy"          // Italy
        };
    }

    /// <summary>
    /// Education related enum values
    /// </summary>
    public static class Education
    {
        public static readonly string[] Degrees =
        {
            "Bachelor",      // Bachelor's degree
            "Master",        // Master's degree
            "Doctorate",     // Doctorate
            "Associate",     // Associate degree
            "Certificate",   // Certificate
            "Diploma",       // Diploma
            "High School",   // High school
            "Vocational",    // Vocational
            "Postgraduate",  // Postgraduate
            "Professional"   // Professional
        };

        public static readonly string[] FieldsOfStudy =
        {
            "Computer Science",           // Computer Science
            "Business Administration",    // Business Administration
            "Engineering",               // Engineering
            "Medicine",                  // Medicine
            "Law",                       // Law
            "Education",                 // Education
            "Arts",                      // Arts
            "Sciences",                  // Sciences
            "Mathematics",               // Mathematics
            "Physics",                   // Physics
            "Chemistry",                 // Chemistry
            "Biology",                   // Biology
            "Economics",                 // Economics
            "Finance",                   // Finance
            "Marketing",                 // Marketing
            "Psychology",                // Psychology
            "Sociology",                 // Sociology
            "History",                   // History
            "Literature",                // Literature
            "Languages"                  // Languages
        };

        public static readonly string[] Grades =
        {
            "A+", "A", "A-",
            "B+", "B", "B-",
            "C+", "C", "C-",
            "D+", "D", "D-",
            "F",
            "Pass", "Fail",
            "Distinction", "Merit", "Pass",
            "First Class", "Second Class", "Third Class"
        };
    }

    /// <summary>
    /// Employee related enum values
    /// </summary>
    public static class Employee
    {
        public static readonly string[] Genders =
        {
            "Male",              // Male
            "Female",            // Female
            "Other",             // Other
            "PreferNotToSay"     // Prefer not to say
        };

        public static readonly string[] MaritalStatuses =
        {
            "Single",            // Single
            "Married",           // Married
            "Divorced",          // Divorced
            "Widowed",           // Widowed
            "Separated",         // Separated
            "Cohabiting"         // Cohabiting
        };

        public static readonly string[] EmploymentStatuses =
        {
            "Active",            // Active
            "Inactive",          // Inactive
            "OnLeave",           // On leave
            "Suspended",         // Suspended
            "Retired",           // Retired
            "Terminated"         // Terminated
        };

        public static readonly string[] EmploymentTypes =
        {
            "FullTime",          // Full-time
            "PartTime",          // Part-time
            "Contract",          // Contract
            "Temporary",         // Temporary
            "Intern",            // Intern
            "Consultant",        // Consultant
            "Freelance"          // Freelance
        };

        public static readonly string[] EmergencyContactRelations =
        {
            "Spouse",            // Spouse
            "Parent",            // Parent
            "Child",             // Child
            "Sibling",           // Sibling
            "Friend",            // Friend
            "Other"              // Other
        };

        public static readonly string[] SalaryCurrencies =
        {
            "CNY",               // Chinese Yuan
            "USD",               // US Dollar
            "EUR",               // Euro
            "GBP",               // British Pound
            "JPY",               // Japanese Yen
            "AUD",               // Australian Dollar
            "CAD",               // Canadian Dollar
            "CHF",               // Swiss Franc
            "HKD",               // Hong Kong Dollar
            "SGD"                // Singapore Dollar
        };

        public static readonly string[] ManagerRoles =
        {
            "None",              // No management role
            "Manager",           // Department Manager (primary manager)
            "DeputyManager",     // Deputy Manager
            "AssistantManager", // Assistant Manager
            "TeamLead",          // Team Lead
            "ProjectManager",    // Project Manager
            "RegionalManager"   // Regional Manager
        };
    }

    /// <summary>
    /// Department related enum values
    /// </summary>
    public static class Department
    {
        public static readonly string[] Levels =
        {
            "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"
        };
    }

    /// <summary>
    /// Position related enum values
    /// </summary>
    public static class Position
    {
        public static readonly string[] Levels =
        {
            "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"
        };

        public static readonly string[] Types =
        {
            "Management",        // Management
            "Technical",         // Technical
            "Administrative",    // Administrative
            "Sales",             // Sales
            "Marketing",         // Marketing
            "Finance",           // Finance
            "HR",                // Human Resources
            "Operations",        // Operations
            "Support",           // Support
            "Executive"          // Executive
        };
    }

    /// <summary>
    /// External API configuration related enum values
    /// </summary>
    public static class ExternalApiConfig
    {
        public static readonly string[] HttpMethods =
        {
            "GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"
        };

        public static readonly string[] Categories =
        {
            "Payment",           // Payment
            "Notification",      // Notification
            "Authentication",    // Authentication
            "Data",              // Data
            "Integration",       // Integration
            "ThirdParty",        // Third Party
            "Internal",          // Internal
            "External"           // External
        };
    }

    /// <summary>
    /// User related enum values
    /// </summary>
    public static class User
    {
        public static readonly string[] Roles =
        {
            "Admin",             // Administrator
            "User",              // User
            "Manager",           // Manager
            "HR",                // Human Resources
            "Finance",           // Finance
            "ReadOnly"           // Read Only
        };
    }

    /// <summary>
    /// Common status enum values
    /// </summary>
    public static class Common
    {
        public static readonly string[] Statuses =
        {
            "Active",            // Active
            "Inactive",          // Inactive
            "Pending",           // Pending
            "Approved",          // Approved
            "Rejected",          // Rejected
            "Suspended",         // Suspended
            "Expired",           // Expired
            "Deleted"            // Deleted
        };

        public static readonly string[] YesNo =
        {
            "Yes", "No"
        };

        public static readonly string[] TrueFalse =
        {
            "True", "False"
        };
    }
}

