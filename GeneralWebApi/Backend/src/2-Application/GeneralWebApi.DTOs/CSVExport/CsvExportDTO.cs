namespace GeneralWebApi.DTOs.CSVExport;

public class CsvExportDTO
{
    public class ProductExportDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public decimal? Price { get; set; }
    }

    public class UserExportDTO
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Role { get; set; }
    }

    public class FileDocumentExportDTO
    {
        public int Id { get; set; }
        public string? FileName { get; set; }
        public string? FileExtension { get; set; }
        public long? FileSize { get; set; }
        public string? FilePath { get; set; }
        public string? FileContentType { get; set; }
    }
}
