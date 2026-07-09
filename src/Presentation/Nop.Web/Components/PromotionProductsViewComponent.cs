using Microsoft.AspNetCore.Mvc;
using Nop.Services.Catalog;
using Nop.Web.Factories;
using Nop.Web.Framework.Components;
using Nop.Web.Models.Homepage;

namespace Nop.Web.Components;

public class PromotionProductsViewComponent : NopViewComponent
{
    private readonly IProductModelFactory _productModelFactory;
    private readonly IProductService _productService;
    private readonly IProductTagService _productTagService;

    public PromotionProductsViewComponent(
        IProductModelFactory productModelFactory,
        IProductService productService,
        IProductTagService productTagService)
    {
        _productModelFactory = productModelFactory;
        _productService = productService;
        _productTagService = productTagService;
    }

    public async Task<IViewComponentResult> InvokeAsync()
    {
        var tags = await _productTagService.GetAllProductTagsAsync();

        var tag = tags.FirstOrDefault(x =>
            x.Name.Equals("акция", StringComparison.OrdinalIgnoreCase));

        if (tag == null)
            return Content("");

        var products = await _productService.SearchProductsAsync(
            productTagId: tag.Id,
            pageIndex: 0,
            pageSize: 20);

        if (!products.Any())
            return Content("");

        var productsModels =
            await _productModelFactory.PrepareProductOverviewModelsAsync(products);

        var model = new HomepageProductBlockModel
        {
            Title = "Акции",
            Products = productsModels.ToList()
        };

        return View(model);
    }
}
