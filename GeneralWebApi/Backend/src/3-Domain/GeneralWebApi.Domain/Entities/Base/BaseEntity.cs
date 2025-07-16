namespace GeneralWebApi.Domain.Entities.Base;

public abstract class BaseEntity
{
    // primary key
    public int Id { get; set; }
    
    // audit fields
    public DateTime CreatedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    
    // soft delete
    public bool IsDeleted { get; set; } = false;
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
    
    // version control (optimistic locking)
    public int Version { get; set; } = 1;
    
    // status
    public bool IsActive { get; set; } = true;
    
    // sort order
    public int SortOrder { get; set; } = 0;
    
    // remarks
    public string? Remarks { get; set; }
}