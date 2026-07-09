using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Custom.Weighable.Models;
using Custom.Weighable.Services;

namespace Custom.Weighable.Components
{
    public class WeighableViewComponent : ViewComponent
    {
        private readonly IWeighableService _service;

        public WeighableViewComponent(IWeighableService service)
        {
            _service = service;
        }

        public async Task<IViewComponentResult> InvokeAsync(int productId)
        {
            var model = new WeighableModel
            {
                ProductId = productId,
                IsWeighable = await _service.GetIsWeighableAsync(productId)
            };

            return View("~/Plugins/Custom.Weighable/Views/Admin/ProductWeighable.cshtml", model);
        }
    }
}