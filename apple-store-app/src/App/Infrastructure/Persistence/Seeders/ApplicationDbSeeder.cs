using Domain.Constants;
using Domain.Entities.Sales;
using Domain.Enums.Sales;
using Infrastructure.Identity.Models;
using Infrastructure.Persistence;

namespace Infrastructure.Persistence.Seeders
{
    public class ApplicationDbSeeder
    {
        private readonly RoleManager<ApplicationRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _dbContext;

        public ApplicationDbSeeder(
            RoleManager<ApplicationRole> roleManager,
            UserManager<ApplicationUser> userManager,
            AppDbContext dbContext)
        {
            _roleManager = roleManager;
            _userManager = userManager;
            _dbContext = dbContext;
        }

        public async Task SeedAsync()
        {
            await SeedRolesAsync();
            await SeedUsersAsync();
            await SeedVouchersAsync();
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

        private async Task SeedVouchersAsync()
        {
            var now = DateTimeOffset.UtcNow;
            if (!await _dbContext.Vouchers.AnyAsync())
            {
                var publicVoucher = new Voucher
                {
                    Code = "APPLE2026",
                    Name = "Ưu đãi năm mới 2026",
                    Description = "Giảm 10% tối đa 1.000.000đ cho đơn hàng từ 10.000.000đ",
                    TargetType = VoucherTargetType.Public,
                    DiscountType = VoucherDiscountType.Percentage,
                    DiscountValue = 10,
                    MinOrderAmount = 10000000,
                    MaxDiscountAmount = 1000000,
                    StartDate = now.AddDays(-10),
                    EndDate = now.AddDays(365),
                    UsageLimit = 1000,
                    UsageCount = 0,
                    PerUserLimit = 2,
                    IsActive = true
                };

                var registeredVoucher = new Voucher
                {
                    Code = "CHAOBANMOI",
                    Name = "Chào bạn mới - Thành viên Apple",
                    Description = "Giảm ngay 500.000đ cho đơn hàng từ 5.000.000đ khi đăng nhập",
                    TargetType = VoucherTargetType.RegisteredOnly,
                    DiscountType = VoucherDiscountType.FixedAmount,
                    DiscountValue = 500000,
                    MinOrderAmount = 5000000,
                    MaxDiscountAmount = 500000,
                    StartDate = now.AddDays(-10),
                    EndDate = now.AddDays(365),
                    UsageLimit = 500,
                    UsageCount = 0,
                    PerUserLimit = 1,
                    IsActive = true
                };

                var vipVoucher = new Voucher
                {
                    Code = "VIPAPPLE",
                    Name = "Voucher đặc quyền VIP",
                    Description = "Giảm trực tiếp 1.000.000đ cho khách hàng thân thiết với đơn từ 15.000.000đ",
                    TargetType = VoucherTargetType.AssignedOnly,
                    DiscountType = VoucherDiscountType.FixedAmount,
                    DiscountValue = 1000000,
                    MinOrderAmount = 15000000,
                    MaxDiscountAmount = 1000000,
                    StartDate = now.AddDays(-10),
                    EndDate = now.AddDays(365),
                    UsageLimit = 100,
                    UsageCount = 0,
                    PerUserLimit = 1,
                    IsActive = true
                };

                _dbContext.Vouchers.AddRange(publicVoucher, registeredVoucher, vipVoucher);
                await _dbContext.SaveChangesAsync();

                var normalUser = await _userManager.FindByEmailAsync("user@apple-store.com");
                if (normalUser != null)
                {
                    var userVoucher = new UserVoucher
                    {
                        UserId = normalUser.Id,
                        VoucherId = vipVoucher.Id,
                        AssignedUsageLimit = 100,
                        UsedCount = 0,
                        AssignedAt = now,
                        ExpiresAt = now.AddDays(365),
                        AssignedBy = "System",
                        Note = "Tặng khách hàng thân thiết",
                        IsActive = true
                    };
                    _dbContext.UserVouchers.Add(userVoucher);
                    await _dbContext.SaveChangesAsync();
                }
            }

            if (!await _dbContext.Vouchers.AnyAsync(v => v.Code == "APPLE500K"))
            {
                _dbContext.Vouchers.Add(new Voucher
                {
                    Code = "APPLE500K",
                    Name = "Ưu đãi tri ân khách hàng",
                    Description = "Giảm trực tiếp 500.000đ cho đơn hàng từ 15.000.000đ",
                    TargetType = VoucherTargetType.Public,
                    DiscountType = VoucherDiscountType.FixedAmount,
                    DiscountValue = 500000,
                    MinOrderAmount = 15000000,
                    MaxDiscountAmount = 500000,
                    StartDate = now.AddDays(-10),
                    EndDate = now.AddDays(365),
                    UsageLimit = 5000,
                    UsageCount = 0,
                    PerUserLimit = 100,
                    IsActive = true
                });
                await _dbContext.SaveChangesAsync();
            }

            var allExistingVouchers = await _dbContext.Vouchers.ToListAsync();
            foreach (var v in allExistingVouchers)
            {
                v.PerUserLimit = 100;
                v.UsageLimit = 10000;
            }
            await _dbContext.SaveChangesAsync();

            var existingNormalUser = await _userManager.FindByEmailAsync("user@apple-store.com");
            if (existingNormalUser != null && string.IsNullOrEmpty(existingNormalUser.PhoneNumber))
            {
                existingNormalUser.PhoneNumber = "0912345678";
                await _userManager.UpdateAsync(existingNormalUser);
            }
        }
    }
}
