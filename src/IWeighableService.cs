using System.Threading.Tasks;

namespace Custom.Weighable.Services
{
    public interface IWeighableService
    {
        Task<bool> GetIsWeighableAsync(int productId);
        Task SetIsWeighableAsync(int productId, bool value);
    }
}