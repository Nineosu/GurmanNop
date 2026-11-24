namespace Nop.Web.Areas.Admin.Models.Orders;

public class PrintOrderModel
{
    public int Id { get; set; }

    public string OrderNumber { get; set; }

    public DateTime CreatedOn { get; set; }

    public string FullName { get; set; }

    public string Phone { get; set; }

    public string Address { get; set; }

    public string Address2 { get; set; }

    public string Comment { get; set; }

    public decimal Total { get; set; }

    public List<PrintOrderItemModel> Items { get; set; } = new();
}


public class PrintOrderItemModel
{
    public string Name { get; set; }

    public string Sku { get; set; }

    public decimal Price { get; set; }

    public string Weight { get; set; }

    public int Quantity { get; set; }

    public decimal Total { get; set; }
    public string PictureUrl { get; set; }
}