using Microsoft.AspNetCore.Mvc;
using Nop.Core;
using Nop.Services.Catalog;
using Nop.Services.Media;
using Nop.Services.Seo;
using Nop.Web.Models.Catalog;

namespace Nop.Web.Components
{
    public class SidebarCategoriesViewComponent : ViewComponent
    {
        private readonly ICategoryService _categoryService;
        private readonly IPictureService _pictureService;
        private readonly IUrlRecordService _urlRecordService;
        private readonly IStoreContext _storeContext;
        private readonly IWorkContext _workContext;

        public SidebarCategoriesViewComponent(
            ICategoryService categoryService,
            IPictureService pictureService,
            IUrlRecordService urlRecordService,
            IStoreContext storeContext,
            IWorkContext workContext)
        {
            _categoryService = categoryService;
            _pictureService = pictureService;
            _urlRecordService = urlRecordService;
            _storeContext = storeContext;
            _workContext = workContext;
        }

        public async Task<IViewComponentResult> InvokeAsync()
        {
            var store = await _storeContext.GetCurrentStoreAsync();
            var customer = await _workContext.GetCurrentCustomerAsync();

            var categories = await _categoryService.GetAllCategoriesAsync(store.Id);

            var model = new List<SidebarCategoryModel>();

            foreach (var category in categories)
            {
                if (!category.Published)
                    continue;

                if (category.ParentCategoryId != 0)
                    continue;

                var seName = await _urlRecordService.GetSeNameAsync(category, customer.LanguageId);

                var pictureUrl = await _pictureService.GetPictureUrlAsync(
                    category.PictureId,
                    showDefaultPicture: true);

                model.Add(new SidebarCategoryModel
                {
                    Id = category.Id,
                    Name = category.Name,
                    SeName = seName,
                    PictureUrl = pictureUrl
                });
            }

            return View(model);
        }
    }
}