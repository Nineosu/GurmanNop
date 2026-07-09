using Nop.Web.Models.Catalog;

namespace Nop.Web.Models.Homepage;

public class HomepageProductBlockModel
{
    public string Title { get; set; }
    public List <ProductOverviewModel> Products { get; set; }
}