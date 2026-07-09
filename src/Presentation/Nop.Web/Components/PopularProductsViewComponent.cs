using Microsoft.AspNetCore.Mvc;
using Nop.Core;
using Nop.Core.Domain.Orders;
using Nop.Data;
using Nop.Services.Catalog;
using Nop.Web.Factories;
using Nop.Web.Framework.Components;
using Nop.Web.Models.Homepage;

namespace Nop.Web.Components;

public class PopularProductsViewComponent : NopViewComponent
{
    private readonly IRepository<OrderItem> _orderItemRepository;
    private readonly IProductService _productService;
    private readonly IProductModelFactory _productModelFactory;

    public PopularProductsViewComponent(
        IRepository<OrderItem> orderItemRepository,
        IProductService productService,
        IProductModelFactory productModelFactory)
    {
        _orderItemRepository = orderItemRepository;
        _productService = productService;
        _productModelFactory = productModelFactory;
    }

    public async Task<IViewComponentResult> InvokeAsync()
    {
        var topProductIds = _orderItemRepository.Table
            .GroupBy(x => x.ProductId)
            .Select(g => new
            {
                ProductId = g.Key,
                TotalSold = g.Sum(x => x.Quantity)
            })
            .OrderByDescending(x => x.TotalSold)
            .Take(20)
            .Select(x => x.ProductId)
            .ToList();

        if (!topProductIds.Any())
            return Content("");

        var products = await _productService.GetProductsByIdsAsync(topProductIds.ToArray());

        // При необходимости восстановить порядок по популярности
        products = topProductIds
            .Join(products,
                id => id,
                p => p.Id,
                (_, p) => p)
            .ToList();

        var models =
            await _productModelFactory.PrepareProductOverviewModelsAsync(products);

        return View(new HomepageProductBlockModel
        {
            Title = "Популярные товары",
            Products = models.ToList()
        });
    }
}