FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["App.sln", "./"]
COPY ["src/App/Domain/Domain.csproj", "src/App/Domain/"]
COPY ["src/App/Application/Application.csproj", "src/App/Application/"]
COPY ["src/App/Infrastructure/Infrastructure.csproj", "src/App/Infrastructure/"]
COPY ["src/Host/Host.csproj", "src/Host/"]

RUN dotnet restore "App.sln"

COPY . .

RUN dotnet publish "src/Host/Host.csproj" -c Release -o /app/publish /p:UseAppHost=false --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080

RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Host.dll"]
