FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["DoanVienAPI.csproj", "./"]
RUN dotnet restore "DoanVienAPI.csproj"
COPY . .
RUN dotnet build "DoanVienAPI.csproj" -c Release -o /app/build
RUN dotnet publish "DoanVienAPI.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "DoanVienAPI.dll"]
