using Application.Features.Catalog.StorageOptions.DTOs;
using Application.Features.Catalog.StorageOptions.Services;

namespace Host.Controllers.Public
{
    [Tags("Public - StorageOptions")]
    [Route("api/storage-options")]
    [Route("api/public/storage-options")]
    public class StorageOptionsController : BasePublicController
    {
        private readonly IStorageOptionService _storageOptionService;

        public StorageOptionsController(IStorageOptionService storageOptionService)
        {
            _storageOptionService = storageOptionService;
        }

        [HttpGet]
        [HttpGet("all")]
        public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
        {
            var result = await _storageOptionService.GetAllAsync(cancellationToken);
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken)
        {
            var result = await _storageOptionService.GetByIdAsync(id, cancellationToken);
            return Ok(result);
        }
    }
}
