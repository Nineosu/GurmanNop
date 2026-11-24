using Microsoft.AspNetCore.Mvc;
using Nop.Services.Catalog;
using Nop.Services.Common;
using Nop.Services.Media;
using Nop.Services.Orders;
using Nop.Web.Areas.Admin.Models.Orders;

namespace Nop.Web.Areas.Admin.Controllers;

public class OrderPrintController : BaseAdminController
{
    private readonly IOrderService _orderService;
    private readonly IAddressService _addressService;
    private readonly IProductService _productService;
    private readonly IPictureService _pictureService;

    public OrderPrintController(
    IOrderService orderService,
    IAddressService addressService,
    IProductService productService,
    IPictureService pictureService)
    {
        _orderService = orderService;
        _addressService = addressService;
        _productService = productService;
        _pictureService = pictureService;
    }


    public async Task<IActionResult> Print(int id)
    {
        var order = await _orderService.GetOrderByIdAsync(id);

        if (order == null)
            return NotFound();


        var address = await _addressService.GetAddressByIdAsync(order.BillingAddressId);


        var model = new PrintOrderModel
        {
            Id = order.Id,

            OrderNumber = order.CustomOrderNumber,

            CreatedOn = order.CreatedOnUtc.ToLocalTime(),

            Total = order.OrderTotal,


            FullName =
                $"{address.FirstName} {address.LastName}",


            Phone =
                address.PhoneNumber,


            Address =
                $"{address.City} {address.Address1}",


            Address2 =
                address.Address2
        };

        var orderItems = await _orderService.GetOrderItemsAsync(order.Id);

        foreach (var item in orderItems)
        {
            var product = await _productService.GetProductByIdAsync(item.ProductId);

            if (product == null)
                continue;

            var weight = "";

            if (!string.IsNullOrEmpty(item.AttributeDescription))
            {
                var match = System.Text.RegularExpressions.Regex.Match(
                    item.AttributeDescription,
                    @"Вес:\s*([^<\[]+)"
                );

                if (match.Success)
                    weight = match.Groups[1].Value.Trim();
            }

            var pictureUrl = "";

            var productPictures = await _productService.GetProductPicturesByProductIdAsync(product.Id);

            var firstPicture = productPictures.FirstOrDefault();

            if (firstPicture != null)
            {
                pictureUrl = await _pictureService.GetPictureUrlAsync(
                    firstPicture.PictureId,
                    targetSize: 300
                );
            }


            model.Items.Add(new PrintOrderItemModel
            {
                Name = product.Name,
                Sku = product.Sku,
                Weight = weight,
                Price = item.UnitPriceInclTax,
                Quantity = item.Quantity,
                Total = item.PriceInclTax,
                PictureUrl = pictureUrl
            });
        }


        return View(model);
    }
}