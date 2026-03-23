# .NET Project Detection Patterns

Guidelines for identifying .NET project characteristics.

## 1. SDK and Framework Detection

### SDK Type (`Project Sdk="..."`)
- `Microsoft.NET.Sdk.Web`: ASP.NET Core Web API or MVC.
- `Microsoft.NET.Sdk.BlazorWebAssembly`: Blazor WebAssembly.
- `Microsoft.NET.Sdk.Razor`: Razor Class Library.
- `Microsoft.NET.Sdk.Worker`: Background service or worker.
- `Microsoft.NET.Sdk`: Generic class library, console app, or WPF/WinForms.

### Target Framework (`<TargetFramework>`)
- `net10.0`, `net9.0`, `net8.0`: Modern .NET (Preferred for new features).
- `net6.0`, `net7.0`: Core/Modern .NET (Long-term support or legacy modern).
- `net48`, `net472`: Legacy .NET Framework.

### Modern Project Features
- **Artifacts Output**: Check if `<UseArtifactsOutput>true</UseArtifactsOutput>` exists in `Directory.Build.props` or project files (.NET 8+).
- **Central Package Management (CPM)**: Check for `Directory.Packages.props`.

## 2. App Model Discovery

### Entry Points and Patterns
- `WebApplication.CreateBuilder(args)` in `Program.cs`: Modern Minimal API or Web API.
- `builder.Services.AddControllers()`: Web API (Controller-based).
- `builder.Services.AddRazorPages()` or `AddControllersWithViews()`: MVC / Razor Pages.
- `builder.Services.AddOpenApi()`: .NET 9+ Native OpenAPI (Scalar/Swagger-free).

### Package References (`PackageReference`)
- `Microsoft.EntityFrameworkCore`: Entity Framework Core.
- `Microsoft.AspNetCore.OpenApi`: .NET 9+ native OpenAPI support.
- `Swashbuckle.AspNetCore`: Legacy Swagger support.
- `MediatR`: CQRS/MediatR Pattern.
- `FluentValidation.DependencyInjectionExtensions`: Validation logic.

## 3. Testing and Quality

### Test Runners
- `xunit`: XUnit.
- `NUnit`: NUnit.
- `MSTest.TestAdapter`: MSTest.
- `TUnit`: .NET 9+ Native native runner (check for `TUnit` package).

### Code Quality
- `StyleCop.Analyzers`: StyleCop rules.
- `Roslynator.Analyzers`: Roslynator.
- `SonarAnalyzer.CSharp`: SonarQube analysis.
- `.editorconfig`: Global formatting and analysis rules.
- `GlobalUsings.cs` or `<ImplicitUsings>enable</ImplicitUsings>`: Modern C# usage.
