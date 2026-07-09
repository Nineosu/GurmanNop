using Autofac;
using Nop.Core.Infrastructure.DependencyManagement;
using Nop.Core.Infrastructure;
using Nop.Services.Catalog;

namespace Custom.Weighable.Infrastructure
{
    public class DependencyRegistrar : IDependencyRegistrar
    {
        public void Register(ContainerBuilder builder, ITypeFinder typeFinder, NopConfig config)
        {
            builder.RegisterDecorator<IProductModelFactory>(
                (context, inner) => new WeighableProductModelFactory(
                    inner,
                    context.Resolve<Custom.Weighable.Services.IWeighableService>()
                ));
        }

        public int Order => 1;
    }
}