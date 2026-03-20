# .NET Project Detection Patterns

Guidelines for identifying .NET project characteristics.

## 1. SDK and Framework Detection

### SDK Type (`Project Sdk="..."`)
- `Microsoft.NET.Sdk.Web`: ASP.NET Core Web API or MVC.
- `Microsoft.NET.Sdk.BlazorWebAssembly`: Blazor WebAssembly.
- `Microsoft.NET.Sdk.Razor`: Razor Class Library.
- `Microsoft.NET.Sdk.Worker`: Background service or worker.
- `Microsoft.NET.Sdk`: Generic class library, console app, or WPF/WinForms (check for `<UseWPF>true</UseWPF>` or `<UseWindowsForms>true</UseWindowsForms>`).

### Target Framework (`<TargetFramework>`)
- `net10.0`, `net9.0`, `net8.0`: Modern .NET.
- `netcoreapp3.1`, `net5.0`, `net6.0`, `net7.0`: Core/Modern .NET.
- `net48`, `net472`, `net461`: Legacy .NET Framework.
- `netstandard2.0`, `netstandard2.1`: Library compatible across implementations.

## 2. App Model Discovery

### Entry Points
- `Program.cs` with `var builder = WebApplication.CreateBuilder(args);`: Modern Minimal API or Web API.
- `Startup.cs`: Traditional ASP.NET Core.
- `App.xaml.cs`: WPF, WinUI, or MAUI.
- `Global.asax`: Legacy ASP.NET.

### Package References (`PackageReference`)
- `Microsoft.EntityFrameworkCore`: Entity Framework Core.
- `MediatR`: CQRS/MediatR Pattern.
- `FluentValidation`: Validation logic.
- `Microsoft.Azure.Functions.Worker`: Azure Functions.
- `Microsoft.SemanticKernel`: AI / Semantic Kernel.

## 3. Testing and Quality

### Test Runners
- `xunit`: XUnit.
- `NUnit`: NUnit.
- `MSTest.TestAdapter`: MSTest.
- `TUnit`: TUnit (Modern native runner).

### Code Quality
- `StyleCop.Analyzers`: StyleCop.
- `Roslynator`: Roslynator.
- `SonarAnalyzer.CSharp`: SonarQube.
- `.editorconfig`: Global formatting and analysis rules.
