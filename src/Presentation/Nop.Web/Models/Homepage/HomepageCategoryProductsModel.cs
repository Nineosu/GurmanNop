using Nop.Web.Models.Catalog;

namespace Nop.Web.Models.Homepage;

public class HomepageCategoryProductsModel
{
    public string Title { get; set; }

    public string ImageUrl { get; set; }

    public string CategorySeName { get; set; }

    public IList<ProductOverviewModel> Products { get; set; }
}
