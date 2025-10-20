using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using GeneralWebApi.Integration.Repository.Base;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace GeneralWebApi.Integration.Repository.BasesRepository;

public class ProductRepository : BaseRepository<Product>, IProductRepository
{
    public ProductRepository(ApplicationDbContext context, ILogger<ProductRepository> logger)
        : base(context, logger)
    {
    }

    // Product-specific business methods can be added here
    // For now, we inherit all CRUD operations from BaseRepository<Product>
}