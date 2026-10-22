using Application.Features.Catalog.StorageOptions.DTOs;
using Application.Features.Catalog.StorageOptions.Services;

namespace Host.Controllers.Manager
{
    [Tags("Manager - StorageOptions")]
    [Route("api/manager/storage-options")]
    public class StorageOptionsController : BaseManagerController
    {
        private readonly IStorageOptionService _storageOptionService;

        public StorageOptionsController(IStorageOptionService storageOptionService)
        {
            _storageOptionService = storageOptionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetPaged([FromQuery] StorageOptionPagedRequest request, CancellationToken cancellationToken)
        {
            var result = await _storageOptionService.GetPagedAsync(request, cancellationToken);
            return Ok(result);
        }

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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateStorageOptionRequest request, CancellationToken cancellationToken)
        {
            await _storageOptionService.CreateAsync(request, cancellationToken);
            return Ok();
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateStorageOptionRequest request, CancellationToken cancellationToken)
        {
            await _storageOptionService.UpdateAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
        {
            await _storageOptionService.DeleteAsync(id, cancellationToken);
            return Ok();
        }
    }
}
