using System.Threading.Tasks;
using Nop.Services.Common;

namespace Custom.Weighable.Services
{
    public class WeighableService : IWeighableService
    {
        private readonly IGenericAttributeService _genericAttributeService;

        private const string Key = "IsWeighable";
        private const string KeyGroup = "Product";

        public WeighableService(IGenericAttributeService genericAttributeService)
        {
            _genericAttributeService = genericAttributeService;
        }

        public async Task<bool> GetIsWeighableAsync(int productId)
        {
            var value = await _genericAttributeService
                .GetAttributeAsync<string>(productId, Key, KeyGroup);

            return bool.TryParse(value, out var result) && result;
        }

        public async Task SetIsWeighableAsync(int productId, bool value)
        {
            await _genericAttributeService.SaveAttributeAsync(
                new Nop.Core.Domain.Common.GenericAttribute
                {
                    EntityId = productId,
                    Key = Key,
                    KeyGroup = KeyGroup,
                    Value = value.ToString()
                });
        }
    }
}