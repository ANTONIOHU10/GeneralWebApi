using AutoMapper;
using GeneralWebApi.Domain.Entities;
using static GeneralWebApi.DTOs.CSVExport.CsvExportDTO;

namespace GeneralWebApi.Application.Mappings;

public class ExportMappingProfile : Profile
{
    public ExportMappingProfile()
    {
        CreateMap<Product, ProductExportDTO>();
        CreateMap<User, UserExportDTO>();
        CreateMap<FileDocument, FileDocumentExportDTO>();
    }
}