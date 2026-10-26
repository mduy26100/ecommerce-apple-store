using Application.Common.Interfaces.Persistence;
using Application.Features.Sales.Vouchers.DTOs;
using Domain.Entities.Sales;
using Domain.Enums.Sales;

namespace Application.Features.Sales.Vouchers.Services
{
    public class PublicVoucherService : IPublicVoucherService
    {
        private readonly IRepository<Voucher> _voucherRepository;
        private readonly IRepository<VoucherUsage> _voucherUsageRepository;
        private readonly IRepository<UserVoucher> _userVoucherRepository;

        public PublicVoucherService(
            IRepository<Voucher> voucherRepository,
            IRepository<VoucherUsage> voucherUsageRepository,
            IRepository<UserVoucher> userVoucherRepository)
        {
            _voucherRepository = voucherRepository;
            _voucherUsageRepository = voucherUsageRepository;
            _userVoucherRepository = userVoucherRepository;
        }

        public async Task<ValidateVoucherResponse> ValidateVoucherAsync(int? userId, ValidateVoucherRequest request, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(request.VoucherCode))
            {
                return new ValidateVoucherResponse
                {
                    IsValid = false,
                    Message = "Vui lòng nhập mã giảm giá."
                };
            }

            var code = request.VoucherCode.Trim().ToUpperInvariant();
            var allVouchers = await _voucherRepository.ListAsync(cancellationToken);
            var voucher = allVouchers.FirstOrDefault(v => v.Code.ToUpperInvariant() == code && v.IsActive && !v.IsDeleted);

            if (voucher == null)
            {
                return new ValidateVoucherResponse
                {
                    IsValid = false,
                    Message = "Mã giảm giá không tồn tại hoặc đã ngừng áp dụng."
                };
            }

            var now = DateTimeOffset.UtcNow;
            if (now < voucher.StartDate)
            {
                return new ValidateVoucherResponse
                {
                    IsValid = false,
                    Message = "Chương trình ưu đãi này chưa bắt đầu."
                };
            }

            if (now > voucher.EndDate)
            {
                return new ValidateVoucherResponse
                {
                    IsValid = false,
                    Message = "Mã giảm giá này đã hết hạn sử dụng."
                };
            }

            if (voucher.UsageLimit.HasValue && voucher.UsageCount >= voucher.UsageLimit.Value)
            {
                return new ValidateVoucherResponse
                {
                    IsValid = false,
                    Message = "Mã giảm giá này đã hết số lượt sử dụng tối đa."
                };
            }

            if (voucher.MinOrderAmount.HasValue && request.Subtotal < voucher.MinOrderAmount.Value)
            {
                return new ValidateVoucherResponse
                {
                    IsValid = false,
                    Message = $"Đơn hàng phải có giá trị từ {voucher.MinOrderAmount.Value:N0} đ để áp dụng mã này."
                };
            }

            if (voucher.TargetType == VoucherTargetType.RegisteredOnly && !userId.HasValue)
            {
                return new ValidateVoucherResponse
                {
                    IsValid = false,
                    Message = "Mã giảm giá này chỉ dành riêng cho khách hàng đã đăng nhập tài khoản."
                };
            }

            if (voucher.TargetType == VoucherTargetType.AssignedOnly)
            {
                if (!userId.HasValue)
                {
                    return new ValidateVoucherResponse
                    {
                        IsValid = false,
                        Message = "Mã giảm giá cá nhân yêu cầu đăng nhập tài khoản hợp lệ."
                    };
                }

                var userVouchers = await _userVoucherRepository.ListAsync(cancellationToken);
                var userVoucher = userVouchers.FirstOrDefault(uv => uv.UserId == userId.Value && uv.VoucherId == voucher.Id && uv.IsActive && !uv.IsDeleted);

                if (userVoucher == null)
                {
                    return new ValidateVoucherResponse
                    {
                        IsValid = false,
                        Message = "Mã giảm giá này không áp dụng cho tài khoản của bạn."
                    };
                }

                if (userVoucher.UsedCount >= userVoucher.AssignedUsageLimit)
                {
                    return new ValidateVoucherResponse
                    {
                        IsValid = false,
                        Message = "Bạn đã sử dụng hết số lượt cho phép của mã giảm giá này."
                    };
                }

                if (userVoucher.ExpiresAt.HasValue && userVoucher.ExpiresAt.Value < now)
                {
                    return new ValidateVoucherResponse
                    {
                        IsValid = false,
                        Message = "Mã giảm giá được cấp cho bạn đã hết hạn sử dụng."
                    };
                }
            }
            else
            {
                var usages = await _voucherUsageRepository.ListAsync(cancellationToken);

                if (userId.HasValue)
                {
                    var userUsageCount = usages.Count(u => u.VoucherId == voucher.Id && u.UserId == userId.Value && !u.IsDeleted);
                    if (userUsageCount >= voucher.PerUserLimit)
                    {
                        return new ValidateVoucherResponse
                        {
                            IsValid = false,
                            Message = $"Bạn đã đạt giới hạn sử dụng mã này ({voucher.PerUserLimit} lần)."
                        };
                    }
                }
                else
                {
                    var guestUsageCount = usages.Count(u => u.VoucherId == voucher.Id && !u.IsDeleted &&
                        ((!string.IsNullOrEmpty(request.GuestId) && u.GuestId == request.GuestId)
                         || (!string.IsNullOrEmpty(request.Phone) && u.CustomerPhone == request.Phone)
                         || (!string.IsNullOrEmpty(request.Email) && u.CustomerEmail == request.Email)));

                    if (guestUsageCount >= voucher.PerUserLimit)
                    {
                        return new ValidateVoucherResponse
                        {
                            IsValid = false,
                            Message = "Mã giảm giá này đã vượt quá giới hạn lượt sử dụng cho phép."
                        };
                    }
                }
            }

            decimal discountAmount;
            if (voucher.DiscountType == VoucherDiscountType.Percentage)
            {
                discountAmount = request.Subtotal * (voucher.DiscountValue / 100m);
                if (voucher.MaxDiscountAmount.HasValue && discountAmount > voucher.MaxDiscountAmount.Value)
                {
                    discountAmount = voucher.MaxDiscountAmount.Value;
                }
            }
            else
            {
                discountAmount = Math.Min(voucher.DiscountValue, request.Subtotal);
            }

            int remainingUses = 1;
            if (voucher.TargetType == VoucherTargetType.AssignedOnly && userId.HasValue)
            {
                var userVouchers = await _userVoucherRepository.ListAsync(cancellationToken);
                var uv = userVouchers.FirstOrDefault(x => x.UserId == userId.Value && x.VoucherId == voucher.Id && x.IsActive && !x.IsDeleted);
                if (uv != null)
                {
                    remainingUses = Math.Max(0, uv.AssignedUsageLimit - uv.UsedCount);
                }
            }
            else
            {
                var usages = await _voucherUsageRepository.ListAsync(cancellationToken);
                if (userId.HasValue)
                {
                    var userUsageCount = usages.Count(u => u.VoucherId == voucher.Id && u.UserId == userId.Value && !u.IsDeleted);
                    remainingUses = Math.Max(0, voucher.PerUserLimit - userUsageCount);
                }
                else
                {
                    remainingUses = voucher.UsageLimit.HasValue ? Math.Max(0, voucher.UsageLimit.Value - voucher.UsageCount) : voucher.PerUserLimit;
                }
            }

            var finalAmount = Math.Max(0, request.Subtotal - discountAmount);

            return new ValidateVoucherResponse
            {
                IsValid = true,
                VoucherId = voucher.Id,
                VoucherCode = voucher.Code,
                VoucherName = voucher.Name,
                DiscountType = voucher.DiscountType.ToString(),
                DiscountValue = voucher.DiscountValue,
                DiscountAmount = discountAmount,
                FinalAmount = finalAmount,
                RemainingUses = remainingUses,
                Message = "Áp dụng mã giảm giá thành công!"
            };
        }

        public async Task<List<UserVoucherDto>> GetMyVouchersAsync(int? userId, CancellationToken cancellationToken = default)
        {
            var now = DateTimeOffset.UtcNow;
            var allVouchers = await _voucherRepository.ListAsync(cancellationToken);
            var usages = await _voucherUsageRepository.ListAsync(cancellationToken);
            var result = new List<UserVoucherDto>();

            var publicVouchers = allVouchers
                .Where(v => v.IsActive && !v.IsDeleted && v.StartDate <= now && v.EndDate >= now && (!v.UsageLimit.HasValue || v.UsageCount < v.UsageLimit.Value))
                .Where(v => v.TargetType == VoucherTargetType.Public || (userId.HasValue && v.TargetType == VoucherTargetType.RegisteredOnly))
                .ToList();

            foreach (var v in publicVouchers)
            {
                int remainingUses;
                int usedCount = 0;
                if (userId.HasValue)
                {
                    usedCount = usages.Count(u => u.VoucherId == v.Id && u.UserId == userId.Value && !u.IsDeleted);
                    remainingUses = Math.Max(0, v.PerUserLimit - usedCount);
                }
                else
                {
                    remainingUses = v.UsageLimit.HasValue ? Math.Max(0, v.UsageLimit.Value - v.UsageCount) : v.PerUserLimit;
                }

                result.Add(new UserVoucherDto
                {
                    Id = 0,
                    VoucherId = v.Id,
                    Code = v.Code,
                    Name = v.Name,
                    Description = v.Description,
                    DiscountType = v.DiscountType.ToString(),
                    DiscountValue = v.DiscountValue,
                    MinOrderAmount = v.MinOrderAmount,
                    MaxDiscountAmount = v.MaxDiscountAmount,
                    AssignedUsageLimit = v.PerUserLimit,
                    UsedCount = usedCount,
                    RemainingUses = remainingUses,
                    ExpiresAt = v.EndDate,
                    IsAvailable = remainingUses > 0,
                    TargetType = v.TargetType.ToString(),
                });
            }

            if (userId.HasValue)
            {
                var userVouchers = await _userVoucherRepository.ListAsync(cancellationToken);
                var activeUserVouchers = userVouchers
                    .Where(uv => uv.UserId == userId.Value && uv.IsActive && !uv.IsDeleted && uv.UsedCount < uv.AssignedUsageLimit)
                    .Where(uv => !uv.ExpiresAt.HasValue || uv.ExpiresAt.Value >= now)
                    .ToList();

                foreach (var uv in activeUserVouchers)
                {
                    var voucher = allVouchers.FirstOrDefault(v => v.Id == uv.VoucherId && v.IsActive && !v.IsDeleted);
                    if (voucher != null)
                    {
                        var remaining = Math.Max(0, uv.AssignedUsageLimit - uv.UsedCount);
                        result.Add(new UserVoucherDto
                        {
                            Id = uv.Id,
                            VoucherId = voucher.Id,
                            Code = voucher.Code,
                            Name = voucher.Name,
                            Description = uv.Note ?? voucher.Description,
                            DiscountType = voucher.DiscountType.ToString(),
                            DiscountValue = voucher.DiscountValue,
                            MinOrderAmount = voucher.MinOrderAmount,
                            MaxDiscountAmount = voucher.MaxDiscountAmount,
                            AssignedUsageLimit = uv.AssignedUsageLimit,
                            UsedCount = uv.UsedCount,
                            RemainingUses = remaining,
                            ExpiresAt = uv.ExpiresAt ?? voucher.EndDate,
                            IsAvailable = remaining > 0,
                            TargetType = voucher.TargetType.ToString(),
                        });
                    }
                }
            }

            return result;
        }

        public async Task<List<PublicVoucherDto>> GetPublicVouchersAsync(CancellationToken cancellationToken = default)
        {
            var now = DateTimeOffset.UtcNow;
            var allVouchers = await _voucherRepository.ListAsync(cancellationToken);

            var publicVouchers = allVouchers
                .Where(v => v.IsActive && !v.IsDeleted && v.TargetType == VoucherTargetType.Public && v.StartDate <= now && v.EndDate >= now)
                .Where(v => !v.UsageLimit.HasValue || v.UsageCount < v.UsageLimit.Value)
                .OrderBy(v => v.Id)
                .Select(v => new PublicVoucherDto
                {
                    Id = v.Id,
                    Code = v.Code,
                    Name = v.Name,
                    Description = v.Description,
                    DiscountType = v.DiscountType.ToString(),
                    DiscountValue = v.DiscountValue,
                    MinOrderAmount = v.MinOrderAmount,
                    MaxDiscountAmount = v.MaxDiscountAmount,
                    UsageLimit = v.UsageLimit,
                    UsageCount = v.UsageCount,
                    RemainingUses = v.UsageLimit.HasValue ? Math.Max(0, v.UsageLimit.Value - v.UsageCount) : v.PerUserLimit,
                    PerUserLimit = v.PerUserLimit,
                    EndDate = v.EndDate,
                })
                .ToList();

            return publicVouchers;
        }
    }
}
