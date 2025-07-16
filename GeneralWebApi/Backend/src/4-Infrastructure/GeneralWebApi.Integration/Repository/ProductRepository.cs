
using GeneralWebApi.Domain.Entities;
using GeneralWebApi.Integration.Context;
using Microsoft.EntityFrameworkCore;

namespace GeneralWebApi.Integration.Repository;

public class ProductRepository : IProductRepository, IBaseRepository<Product>
{
    private readonly ApplicationDbContext _dbContext;

    public ProductRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Product> AddAsync(Product entity, CancellationToken cancellationToken = default)
    {
        await _dbContext.Products.AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<IEnumerable<Product>> AddRangeAsync(IEnumerable<Product> entities, CancellationToken cancellationToken = default)
    {
        await _dbContext.Products.AddRangeAsync(entities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entities;
    }

    public async Task<Product> DeleteAsync(object id, CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products.FindAsync(id, cancellationToken);
        if (product == null)
        {
            throw new Exception("Product not found");
        }
        _dbContext.Products.Remove(product);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return product;
    }

    public async Task<IEnumerable<Product>> DeleteRangeAsync(IEnumerable<Product> entities, CancellationToken cancellationToken = default)
    {
        _dbContext.Products.RemoveRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entities;
    }

    public async Task<IEnumerable<Product>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Products.ToListAsync(cancellationToken);
    }

    public async Task<Product> GetByIdAsync(object id, CancellationToken cancellationToken = default)
    {
        var product = await _dbContext.Products.FindAsync(id, cancellationToken);
        if (product == null)
        {
            throw new Exception("Product not found");
        }
        return product;
    }

    public async Task<Product> UpdateAsync(Product entity, CancellationToken cancellationToken = default)
    {
        _dbContext.Products.Update(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task<IEnumerable<Product>> UpdateRangeAsync(IEnumerable<Product> entities, CancellationToken cancellationToken = default)
    {
        _dbContext.Products.UpdateRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return entities;
    }
}