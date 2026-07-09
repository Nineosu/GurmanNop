using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Custom.Weighable.Services;
using Custom.Weighable.Models;

namespace Custom.Weighable.Controllers.Admin
{
    [Area("Admin")]
    public class WeighableAdminController : Controller
    {
        private readonly IWeighableService _weighableService;

        public WeighableAdminController(IWeighableService weighableService)
        {
            _weighableService = weighableService;
        }

        [HttpPost]
        public async Task<IActionResult> Save(int productId, bool isWeighable)
        {
            await _weighableService.SetIsWeighableAsync(productId, isWeighable);
            return Ok();
        }
    }
}