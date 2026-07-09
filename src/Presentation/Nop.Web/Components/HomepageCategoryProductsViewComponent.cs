using Microsoft.AspNetCore.Mvc;
using Nop.Core.Domain.Catalog;
using Nop.Services.Catalog;
using Nop.Services.Media;
using Nop.Services.Seo;
using Nop.Web.Factories;
using Nop.Web.Framework.Components;
using Nop.Web.Models.Catalog;
using Nop.Web.Models.Homepage;

namespace Nop.Web.Components;

public class HomepageCategoryProductsViewComponent : NopViewComponent
{
    private readonly ICategoryService _categoryService;
    private readonly IProductService _productService;
    private readonly IProductModelFactory _productModelFactory;
    private readonly IPictureService _pictureService;
    private readonly IUrlRecordService _urlRecordService;

    public HomepageCategoryProductsViewComponent(
        ICategoryService categoryService,
        IProductService productService,
        IProductModelFactory productModelFactory,
        IPictureService pictureService,
        IUrlRecordService urlRecordService)
    {
        _categoryService = categoryService;
        _productService = productService;
        _productModelFactory = productModelFactory;
        _pictureService = pictureService;
        _urlRecordService = urlRecordService;
    }

    public async Task<IViewComponentResult> InvokeAsync(int categoryId)
    {
        var category = await _categoryService.GetCategoryByIdAsync(categoryId);

        if (category == null || category.Deleted || !category.Published)
            return Content("");

        var products = await _productService.SearchProductsAsync(
            categoryIds: new List<int> { category.Id },
            pageSize: 12);

        if (!products.Any())
            return Content("");

        var productModels =
            (await _productModelFactory
                .PrepareProductOverviewModelsAsync(products))
            .ToList();

        var picture = await _pictureService.GetPictureByIdAsync(category.PictureId);

        var pictureUrl = picture != null
            ? (await _pictureService.GetPictureUrlAsync(picture)).Url
            : "";

        var model = new HomepageCategoryProductsModel
        {
            Title = category.Name,
            CategorySeName = await _urlRecordService.GetSeNameAsync(category),
            ImageUrl = pictureUrl,
            Products = productModels
        };

        return View(model);
    }
}