using Application;
using Host.Extensions;
using Host.Filters;
using Host.Middlewares;
using Infrastructure;
using Infrastructure.Persistence;
using Infrastructure.Persistence.Seeders;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHealthChecks();

builder.Services.AddCustomCors(builder.Configuration);

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ApiResponseFilterAttribute>();
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập 'Bearer' [khoảng trắng] rồi đến token."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var dbContext = services.GetRequiredService<AppDbContext>();

    Console.WriteLine("[INFO] [DATABASE] Đang kiểm tra kết nối tới SQL Server và đồng bộ Migrations...");
    var retryCount = 10;
    for (var i = 1; i <= retryCount; i++)
    {
        try
        {
            var canConnect = await dbContext.Database.CanConnectAsync();
            if (!canConnect)
            {
                Console.WriteLine("[INFO] [DATABASE] Cơ sở dữ liệu chưa tồn tại. Đang tiến hành tạo mới và chạy migrations...");
            }
            else
            {
                Console.WriteLine("[INFO] [DATABASE] Đã kết nối cơ sở dữ liệu. Đang kiểm tra và áp dụng các migrations mới nhất...");
            }

            await dbContext.Database.MigrateAsync();
            Console.WriteLine("[SUCCESS] [DATABASE] Khởi tạo / cập nhật migrations lên phiên bản mới nhất hoàn tất!");
            break;
        }
        catch (Exception ex)
        {
            if (i == retryCount)
            {
                Console.WriteLine($"[ERROR] [DATABASE] Không thể kết nối hoặc cập nhật migrations tới SQL Server sau {retryCount} lần thử: {ex.Message}");
                throw;
            }
            Console.WriteLine($"[WARN] [DATABASE] Chưa thể kết nối tới SQL Server (lần thử {i}/{retryCount}): {ex.Message}. Đang thử lại sau 3 giây...");
            await Task.Delay(3000);
        }
    }

    var testDataFile = Path.Combine(AppContext.BaseDirectory, "data-test.sql");
    if (!File.Exists(testDataFile))
    {
        testDataFile = "/app/data-test.sql";
    }
    if (!File.Exists(testDataFile))
    {
        testDataFile = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../data-test.sql"));
    }

    if (File.Exists(testDataFile))
    {
        var hasExistingData = false;
        try
        {
            var connection = dbContext.Database.GetDbConnection();
            if (connection.State != System.Data.ConnectionState.Open)
            {
                await connection.OpenAsync();
            }
            using var checkCmd = connection.CreateCommand();
            checkCmd.CommandText = "SELECT COUNT(1) FROM [catalog].[Products];";
            var countObj = await checkCmd.ExecuteScalarAsync();
            if (countObj != null && Convert.ToInt32(countObj) > 0)
            {
                hasExistingData = true;
            }
        }
        catch
        {
        }

        if (hasExistingData)
        {
            Console.WriteLine("[INFO] [DATABASE] Dữ liệu sản phẩm đã tồn tại trong cơ sở dữ liệu, bỏ qua nạp data-test.sql để bảo toàn dữ liệu.");
        }
        else
        {
            Console.WriteLine("[INFO] [DATABASE] Phát hiện cơ sở dữ liệu chưa có dữ liệu sản phẩm. Đang tiến hành nạp data-test.sql...");
            try
            {
                var sql = await File.ReadAllTextAsync(testDataFile);
                var connection = dbContext.Database.GetDbConnection();
                if (connection.State != System.Data.ConnectionState.Open)
                {
                    await connection.OpenAsync();
                }
                using var command = connection.CreateCommand();
                command.CommandText = sql;
                command.CommandTimeout = 300;
                await command.ExecuteNonQueryAsync();
                Console.WriteLine("[SUCCESS] [DATABASE] Nạp dữ liệu data-test.sql thành công!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] [DATABASE] Lỗi khi nạp data-test.sql: {ex.Message}");
                throw;
            }
        }
    }

    Console.WriteLine("[INFO] [SEEDER] Đang kiểm tra và khởi tạo dữ liệu mặc định...");
    var seeder = services.GetRequiredService<ApplicationDbSeeder>();
    await seeder.SeedAsync();
    Console.WriteLine("[SUCCESS] [SEEDER] Khởi tạo dữ liệu mặc định hoàn tất!");
}

app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCustomCors(builder.Configuration);

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

Console.WriteLine("[SUCCESS] [SERVER] Backend đã khởi động thành công và sẵn sàng nhận request!");

app.Run();
