using Application.Features.Catalog.ProductSpecifications.DTOs;
using Application.Features.Catalog.ProductSpecifications.Services;

namespace Host.Controllers.Manager
{
    [Tags("Manager - Product Specifications")]
    [Route("api/manager/product-specifications")]
    public class ProductSpecificationsController : BaseManagerController
    {
        private readonly IProductSpecificationService _specService;

        public ProductSpecificationsController(IProductSpecificationService specService)
        {
            _specService = specService;
        }

        [HttpGet("by-product/{productId:int}")]
        public async Task<IActionResult> GetByProduct(int productId, CancellationToken cancellationToken)
        {
            var result = await _specService.GetGroupsByProductIdAsync(productId, cancellationToken);
            return Ok(result);
        }

        [HttpGet("groups/{id:int}")]
        public async Task<IActionResult> GetGroupById(int id, CancellationToken cancellationToken)
        {
            var result = await _specService.GetGroupByIdAsync(id, cancellationToken);
            return Ok(result);
        }

        [HttpPost("groups")]
        public async Task<IActionResult> CreateGroup([FromBody] CreateProductSpecificationGroupRequest request, CancellationToken cancellationToken)
        {
            var id = await _specService.CreateGroupAsync(request, cancellationToken);
            return Ok(new { id });
        }

        [HttpPut("groups/{id:int}")]
        public async Task<IActionResult> UpdateGroup(int id, [FromBody] UpdateProductSpecificationGroupRequest request, CancellationToken cancellationToken)
        {
            await _specService.UpdateGroupAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpDelete("groups/{id:int}")]
        public async Task<IActionResult> DeleteGroup(int id, CancellationToken cancellationToken)
        {
            await _specService.DeleteGroupAsync(id, cancellationToken);
            return Ok();
        }

        [HttpPut("groups/by-product/{productId:int}/reorder")]
        public async Task<IActionResult> ReorderGroups(int productId, [FromBody] ReorderGroupRequest request, CancellationToken cancellationToken)
        {
            await _specService.ReorderGroupsAsync(productId, request.OrderedGroupIds, cancellationToken);
            return Ok();
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetSpecById(int id, CancellationToken cancellationToken)
        {
            var result = await _specService.GetSpecByIdAsync(id, cancellationToken);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateSpec([FromBody] CreateProductSpecificationRequest request, CancellationToken cancellationToken)
        {
            var id = await _specService.CreateSpecAsync(request, cancellationToken);
            return Ok(new { id });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateSpec(int id, [FromBody] UpdateProductSpecificationRequest request, CancellationToken cancellationToken)
        {
            await _specService.UpdateSpecAsync(id, request, cancellationToken);
            return Ok();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteSpec(int id, CancellationToken cancellationToken)
        {
            await _specService.DeleteSpecAsync(id, cancellationToken);
            return Ok();
        }

        [HttpPut("by-group/{groupId:int}/reorder")]
        public async Task<IActionResult> ReorderSpecs(int groupId, [FromBody] ReorderSpecRequest request, CancellationToken cancellationToken)
        {
            await _specService.ReorderSpecsAsync(groupId, request.OrderedSpecIds, cancellationToken);
            return Ok();
        }
    }
}
