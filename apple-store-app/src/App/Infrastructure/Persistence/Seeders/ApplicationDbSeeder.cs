using Domain.Constants;
using Infrastructure.Identity.Models;

namespace Infrastructure.Persistence.Seeders
{
    public class ApplicationDbSeeder
    {
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public ApplicationDbSeeder(RoleManager<ApplicationRole> roleManager, UserManager<ApplicationUser> userManager)
        {
            _roleManager = roleManager;
            _userManager = userManager;
        }

        public async Task SeedAsync()
        {
            await SeedRolesAsync();
            await SeedUsersAsync();
        }

        private async Task SeedRolesAsync()
        {
            foreach (var roleName in RoleConstants.AllRoles)
            {
                if (!await _roleManager.RoleExistsAsync(roleName))
                {
                    await _roleManager.CreateAsync(new ApplicationRole
                    {
                        Name = roleName,
                        Description = roleName
                    });
                }
            }
        }

        private async Task SeedUsersAsync()
        {
            var adminEmail = "admin@apple-store.com";
            var adminUser = await _userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    FirstName = "Quản trị viên",
                    LastName = "Apple",
                    IsActive = true
                };

                var createAdminResult = await _userManager.CreateAsync(adminUser, "Admin@123456");
                if (createAdminResult.Succeeded)
                {
                    await _userManager.AddToRoleAsync(adminUser, RoleConstants.SuperAdmin);
                }
            }

            var normalUserEmail = "user@apple-store.com";
            var normalUser = await _userManager.FindByEmailAsync(normalUserEmail);
            if (normalUser == null)
            {
                normalUser = new ApplicationUser
                {
                    UserName = normalUserEmail,
                    Email = normalUserEmail,
                    EmailConfirmed = true,
                    FirstName = "Khách hàng",
                    LastName = "Test",
                    IsActive = true
                };

                var createUserResult = await _userManager.CreateAsync(normalUser, "User@123456");
                if (createUserResult.Succeeded)
                {
                    await _userManager.AddToRoleAsync(normalUser, RoleConstants.User);
                }
            }
        }
    }
}
