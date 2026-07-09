using Nop.Services.Catalog;
using System.Threading.Tasks;

public class WeighableProductModelFactory : IProductModelFactory
{
    private readonly IProductModelFactory _inner;
    private readonly IWeighableService _weighableService;

    public WeighableProductModelFactory(
        IProductModelFactory inner,
        IWeighableService weighableService)
    {
        _inner = inner;
        _weighableService = weighableService;
    }

    public async Task<ProductOverviewModel> PrepareProductOverviewModelAsync(...)
    {
        var model = await _inner.PrepareProductOverviewModelAsync(...);

        model.IsWeighable = await _weighableService.GetIsWeighableAsync(model.Id);

        return model;
    }
}