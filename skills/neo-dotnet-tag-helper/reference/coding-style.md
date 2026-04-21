# .NET Tag Helper Coding Style & Advanced Patterns

This guide defines advanced coding styles and implementation patterns for ASP.NET Core Tag Helpers, specifically targeting complex UI components, extending built-in behaviors, and frontend asset management mechanisms.

## 1. Inheriting and Extending Built-in Tag Helpers

When you need to customize standard form elements (e.g., `<select>`), you should prioritize inheriting from built-in Tag Helpers (e.g., `SelectTagHelper`). This allows you to retain official logic for `id` and `name` generation, as well as support for strongly-typed model validation (`data-val-*`).

### Implementation Key Points:
- The constructor must inject the dependencies required by the base class (e.g., `IHtmlGenerator`).
- You must explicitly set `output.TagName`; otherwise, the browser will output tags with custom names (e.g., `<select-ai-agent>`).
- Call `await base.ProcessAsync(context, output)` to allow the base class to handle native attribute binding.

### Example: Extending a Dropdown
```csharp
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Microsoft.AspNetCore.Mvc.TagHelpers;
using System.Threading.Tasks;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System;

namespace [YourNamespace].TagHelpers
{
    public abstract class BaseSelectTagHelper : SelectTagHelper
    {
        public BaseSelectTagHelper(IHtmlGenerator generator) : base(generator)
        {
        }

        /// <summary>
        /// Manually specified data list or model (corresponds to asp-model, usage determined by subclass)
        /// </summary>
        [HtmlAttributeName("asp-model")]
        public object? AspModel { get; set; }

        /// <summary>
        /// Default placeholder text (e.g., -- Please Select --)
        /// </summary>
        [HtmlAttributeName("placeholder")]
        public string? Placeholder { get; set; }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            // Must explicitly set TagName to "select", otherwise the browser will output custom tag names (e.g., <select-ai-agent>)
            output.TagName = "select";
            output.TagMode = TagMode.StartTagAndEndTag;

            // Let SelectTagHelper handle basic attributes (ID, Name, Validation)
            // Note: SelectTagHelper defaults to generating id, name, class (if validation error), and data-val-* attributes
            await base.ProcessAsync(context, output);

            // Set class, defaults to form-control if not specified
            var existingClass = output.Attributes["class"]?.Value?.ToString();
            if (string.IsNullOrEmpty(existingClass))
            {
                output.Attributes.SetAttribute("class", "form-control");
            }
            else
            {
                output.Attributes.SetAttribute("class", $"{existingClass} form-control");
            }
            
            // If Placeholder is set, add default option first
            if (Placeholder != null)
            {
                var placeholder = Placeholder.Trim();
                output.Content.AppendHtml($"<option value=''>{placeholder}</option>");
            }

            // Preserve original options generation logic
            await GenerateOptionsAsync(output);
        }

        /// <summary>
        /// Abstract method to generate options, implemented by subclasses
        /// </summary>
        protected abstract Task GenerateOptionsAsync(TagHelperOutput output);
    }

    /// <summary>
    /// AI Agent Dropdown
    /// </summary>
    [HtmlTargetElement("select-ai-agent")]
    public class SelectAIAgentTagHelper : BaseSelectTagHelper
    {
        private readonly IAIAnalysisHelper _aiAnalysisHelper;
        private readonly IStringLocalizer<Resource> _localizer;

        public SelectAIAgentTagHelper(IAIAnalysisHelper aiAnalysisHelper, IStringLocalizer<Resource> localizer, Microsoft.AspNetCore.Mvc.ViewFeatures.IHtmlGenerator generator) : base(generator)
        {
            _aiAnalysisHelper = aiAnalysisHelper;
            _localizer = localizer;
        }

        /// <summary>
        /// Whether to filter by enabled status (null: all, true: enabled only, false: disabled only)
        /// </summary>
        [HtmlAttributeName("enabled")]
        public bool? Enabled { get; set; } = null;

        /// <summary>
        /// Generates dropdown options
        /// </summary>
        /// <param name="output">TagHelper Output</param>
        protected override async Task GenerateOptionsAsync(TagHelperOutput output)
        {
            // Get currently selected value
            Guid? selectedValue = For?.Model switch
            {
                Guid g => g,
                string s when Guid.TryParse(s, out var g) => g,
                _ => null
            };

            IEnumerable<AIAgentSimpleDto>? agents;

            if (AspModel != null)
            {
                // If a manual model is specified, the 'enabled' filter attribute is not allowed
                if (Enabled.HasValue)
                {
                    throw new InvalidOperationException("The 'enabled' attribute cannot be used when 'asp-model' is specified.");
                }

                // Validate manual model type
                agents = AspModel as IEnumerable<AIAgentSimpleDto>;
                if (agents == null)
                {
                    throw new InvalidOperationException("The type of 'asp-model' must be IEnumerable<AIAgentSimpleDto>.");
                }
            }
            else if (Enabled == true && selectedValue.HasValue)
            {
                // Special logic: If only enabled agents are requested, but the current selection is disabled, add it to the list
                var allAgents = await _aiAnalysisHelper.GetAIAgents(null);
                var selectedAgent = allAgents?.FirstOrDefault(a => a.ID == selectedValue.Value);

                if (selectedAgent != null && selectedAgent.Enabled != true)
                {
                    // Disabled and selected: add (Disabled) suffix and pin to top; others show only enabled
                    var filteredAgents = new List<AIAgentSimpleDto> { selectedAgent };
                    filteredAgents.AddRange(allAgents.Where(a => a.Enabled == true && a.ID != selectedValue.Value));
                    agents = filteredAgents;
                }
                else
                {
                    // Not disabled or not found: show only enabled
                    agents = allAgents?.Where(a => a.Enabled == true);
                }
            }
            else
            {
                // General case: get data from Service based on Enabled attribute
                agents = await _aiAnalysisHelper.GetAIAgents(Enabled);
            }

            var sb = new StringBuilder();

            if (agents != null)
            {
                foreach (var agent in agents)
                {
                    var idStr = agent.ID.ToString();
                    var selected = agent.ID == selectedValue ? "selected='selected'" : "";
                    var isEnabledStr = agent.Enabled == true ? "" : $" ({_localizer["ItemDisabled"]})";
                    var name = $"{agent.Name}{isEnabledStr}";
                    sb.Append($"<option value='{idStr}' {selected}>{name}</option>");
                }
            }

            output.Content.AppendHtml(sb.ToString());
        }
    }
}

---

## 2. Composite Complex UI Components and Model Binding

For complex UIs containing multiple elements (like a complete search form), you should use `TagBuilder` to compose the DOM structure. Using `ModelExpression` allows you to accurately bind Tag Helper attributes to ViewModel properties, retrieve the exact field name (`.Name`) for the frontend, and integrate backend permission validation logic.

### Example: Composite Search Bar
```csharp
    /// <summary>
    /// Composite AI Report Search TagHelper.
    /// A UI component integrating date range, business unit, submission unit, inspection report menu, and search button.
    /// </summary>
    [HtmlTargetElement("combo-ai-report-search")]
    public class ComboAIReportSearchTagHelper : TagHelper
    {
        private readonly CommonService _commonService;
        private readonly IAIAnalysisHelper _aiAnalysisHelper;
        private readonly IHtmlGenerator _generator;
        private readonly IFileVersionProvider _fileVersionProvider;

        public ComboAIReportSearchTagHelper(
            CommonService commonService,
            IAIAnalysisHelper aiAnalysisHelper,
            IHtmlGenerator generator,
            IFileVersionProvider fileVersionProvider)
        {
            _commonService = commonService;
            _aiAnalysisHelper = aiAnalysisHelper;
            _generator = generator;
            _fileVersionProvider = fileVersionProvider;
        }

        /// <summary>
        /// Whether to automatically load corresponding JS and CSS, default is true.
        /// If set to true, TagHelper automatically inserts related resource tags after the component, ensuring they load only once per request.
        /// </summary>
        [HtmlAttributeName("auto-load-assets")]
        public bool AutoLoadAssets { get; set; } = true;

        #region Model Binding Attributes (Supports custom ID and Name)
        /// <summary>
        /// Model expression bound to start date
        /// </summary>
        [HtmlAttributeName("asp-for-sdate")]
        public ModelExpression ForSDate { get; set; }

        /// <summary>
        /// Model expression bound to end date
        /// </summary>
        [HtmlAttributeName("asp-for-edate")]
        public ModelExpression ForEDate { get; set; }

        /// <summary>
        /// Model expression bound to business unit
        /// </summary>
        [HtmlAttributeName("asp-for-bu")]
        public ModelExpression ForBusinessUnit { get; set; }

        /// <summary>
        /// Model expression bound to submission unit (HISNo)
        /// </summary>
        [HtmlAttributeName("asp-for-hisno")]
        public ModelExpression ForHISNo { get; set; }

        /// <summary>
        /// Model expression bound to inspection report
        /// </summary>
        [HtmlAttributeName("asp-for-report")]
        public ModelExpression ForAIReport { get; set; }
        #endregion

        #region Class Attributes (Supports CSS customization)
        [HtmlAttributeName("sdate-class")]
        public string SDateClass { get; set; } = "form-control";

        [HtmlAttributeName("edate-class")]
        public string EDateClass { get; set; } = "form-control";

        [HtmlAttributeName("bu-class")]
        public string BusinessUnitClass { get; set; } = "form-control";

        [HtmlAttributeName("hisno-class")]
        public string HISNoClass { get; set; } = "form-control";

        [HtmlAttributeName("report-class")]
        public string AIReportClass { get; set; } = "form-control";

        [HtmlAttributeName("btn-class")]
        public string BtnClass { get; set; } = "btn btn-primary";
        #endregion

        /// <summary>
        /// Gets the current ViewContext to access HttpContext and other information
        /// </summary>
        [HtmlAttributeNotBound]
        [ViewContext]
        public ViewContext ViewContext { get; set; }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            var currentUser = _commonService.GetUserInfo();
            var currentDT = _commonService.GetCurrentDateTime();
            var isSuperAdmin = currentUser.IsSuperAdminRole;

            // Set outer container
            output.TagName = "div";
            output.TagMode = TagMode.StartTagAndEndTag;
            output.Attributes.SetAttribute("class", "ai-report-search-container");

            // Generate IDs for menus and buttons (using CreateSanitizedId ensures IDs are safe for frontend selectors)
            string sDateId = TagBuilder.CreateSanitizedId(ForSDate.Name, "_");
            string eDateId = TagBuilder.CreateSanitizedId(ForEDate.Name, "_");
            string buId = ForBusinessUnit != null ? TagBuilder.CreateSanitizedId(ForBusinessUnit.Name, "_") : "Search_BusinessUnit";
            string hisNoId = TagBuilder.CreateSanitizedId(ForHISNo.Name, "_");
            string reportId = TagBuilder.CreateSanitizedId(ForAIReport.Name, "_");
            string btnId = "btnSearchAIReport";

            var inputGroup = new TagBuilder("div");
            inputGroup.AddCssClass("input-group");

            // 1. Start date (generate label and input)
            inputGroup.InnerHtml.AppendHtml(CreateSpan("Date"));
            inputGroup.InnerHtml.AppendHtml(CreateInput(sDateId, "date", SDateClass, DateTime.Now.ToString("yyyy-MM-dd"), "Start Date"));

            // 2. End date
            inputGroup.InnerHtml.AppendHtml(CreateSpan("To"));
            inputGroup.InnerHtml.AppendHtml(CreateInput(eDateId, "date", EDateClass, DateTime.Now.ToString("yyyy-MM-dd"), "End Date"));

            // 3. Business Unit (Visible to Super Admin only)
            if (isSuperAdmin)
            {
                inputGroup.InnerHtml.AppendHtml(CreateSpan("Business Unit"));
                inputGroup.InnerHtml.AppendHtml(CreateSelect(buId, BusinessUnitClass));
            }

            // 4. Submission Unit (Automatically filtered or initialized based on permissions)
            inputGroup.InnerHtml.AppendHtml(CreateSpan("Submission Unit"));
            var hisNoSelect = CreateSelect(hisNoId, HISNoClass);
            if (!isSuperAdmin)
            {
                // Non-Super Admin: Pre-fetch authorized organization list and populate dropdown
                var options = await GetAllowListOptionsAsync(currentUser.UserID, currentDT);
                hisNoSelect.InnerHtml.AppendHtml("<option></option>");
                foreach (var opt in options)
                {
                    var optionTag = new TagBuilder("option");
                    optionTag.Attributes.Add("value", opt.Value);
                    optionTag.InnerHtml.Append(opt.Text);
                    hisNoSelect.InnerHtml.AppendHtml(optionTag);
                }
            }
            inputGroup.InnerHtml.AppendHtml(hisNoSelect);

            // 5. Inspection Report (Default empty, populated asynchronously by JS via API)
            inputGroup.InnerHtml.AppendHtml(CreateSpan("Inspection Report"));
            var reportSelect = CreateSelect(reportId, AIReportClass);
            reportSelect.InnerHtml.AppendHtml("<option></option>");
            inputGroup.InnerHtml.AppendHtml(reportSelect);

            // 6. Search Button
            var btn = new TagBuilder("button");
            btn.Attributes.Add("type", "button");
            btn.Attributes.Add("id", btnId);
            btn.AddCssClass(BtnClass);
            btn.InnerHtml.AppendHtml("<i class='fa fa-search'></i> Search");
            inputGroup.InnerHtml.AppendHtml(btn);

            output.Content.SetHtmlContent(inputGroup);

            // Auto-load assets (integrates with project's existing asset collector pattern)
            if (AutoLoadAssets)
            {
                var httpContext = ViewContext.HttpContext;
                
                // 1. Load CSS (Pushed to Layout's RenderStyles for processing)
                string cssPath = "[your-css-path]";
                string vCssPath = _fileVersionProvider.AddFileVersionToPath(httpContext.Request.PathBase, cssPath);
                httpContext.AddStyle($"<link rel=\"stylesheet\" href=\"{vCssPath}\" />", "ComboAIReportSearch");

                // 2. Load JS (Pushed to Layout's RenderScripts for processing)
                string jsPath = "[your-js-path]";
                string vJsPath = _fileVersionProvider.AddFileVersionToPath(httpContext.Request.PathBase, jsPath);
                httpContext.AddScript($"<script src=\"{vJsPath}\"></script>", "ComboAIReportSearch");
            }
        }

        #region Helper Methods (Used to generate TagBuilder elements)
        private TagBuilder CreateSpan(string text)
        {
            var span = new TagBuilder("span");
            span.AddCssClass("input-group-text");
            span.InnerHtml.Append(text);
            return span;
        }

        private TagBuilder CreateInput(string id, string type, string className, string value, string title)
        {
            var input = new TagBuilder("input");
            input.Attributes.Add("type", type);
            input.Attributes.Add("id", id);
            input.Attributes.Add("name", id);
            input.Attributes.Add("value", value);
            input.Attributes.Add("title", title);
            input.AddCssClass(className);
            return input;
        }

        private TagBuilder CreateSelect(string id, string className)
        {
            var select = new TagBuilder("select");
            select.Attributes.Add("id", id);
            select.Attributes.Add("name", id);
            select.AddCssClass(className);
            return select;
        }
        #endregion

        /// <summary>
        /// Gets the list of all authorized submission organizations for the current user
        /// </summary>
        private async Task<List<SelectListItem>> GetAllowListOptionsAsync(string userId, DateTime currentDT)
        {
            var authOrgs = await _aiAnalysisHelper.GetAuthorizedOrganizationsAsync(userId, currentDT);
            return authOrgs.Select(x => new SelectListItem
            {
                Value = x.HisNo,
                Text = $"[{x.HisNo}] {x.OrgName}"
            }).ToList();
        }
    }

---

## 3. Automatic Frontend Asset Loading and Deduplication (Asset Management)

When a Tag Helper depends on specific JavaScript or CSS, developers must ensure that these resources are not loaded multiple times if the tag is used repeatedly on the same page. It is recommended to implement an asset collector pattern by extending `HttpContext.Items`.

### Example: Asset Deduplication Extension Methods

```csharp
public static partial class HtmlExtension
{
    public static IHtmlContent Script(this IHtmlHelper htmlHelper, Func<object, HelperResult> template)
    {
        htmlHelper.ViewContext.HttpContext.Items["_script_" + Guid.NewGuid()] = template;
        return new HtmlContentBuilder();
    }

    public static IHtmlContent RenderScripts(this IHtmlHelper htmlHelper)
    {
        foreach (object key in htmlHelper.ViewContext.HttpContext.Items.Keys)
        {
            if (key.ToString().StartsWith("_script_"))
            {
                var template = htmlHelper.ViewContext.HttpContext.Items[key] as Func<object, Microsoft.AspNetCore.Mvc.Razor.HelperResult>;
                if (template != null)
                {
                    htmlHelper.ViewContext.Writer.Write(template(null));
                }
            }
        }

        return new HtmlContentBuilder();
    }

    /// <summary>
    /// Allows TagHelper or backend logic to add scripts, supporting deduplication (via key)
    /// </summary>
    public static void AddScript(this Microsoft.AspNetCore.Http.HttpContext httpContext, string script, string key = null)
    {
        string storageKey = "_script_" + (key ?? Guid.NewGuid().ToString());
        if (httpContext.Items.ContainsKey(storageKey)) return;

        httpContext.Items[storageKey] = new Func<object, HelperResult>(arg => new HelperResult(writer =>
        {
            writer.Write(script);
            return System.Threading.Tasks.Task.CompletedTask;
        }));
    }

    public static IHtmlContent RenderStyles(this IHtmlHelper htmlHelper)
    {
        foreach (object key in htmlHelper.ViewContext.HttpContext.Items.Keys)
        {
            if (key.ToString().StartsWith("_style_"))
            {
                var template = htmlHelper.ViewContext.HttpContext.Items[key] as Func<object, Microsoft.AspNetCore.Mvc.Razor.HelperResult>;
                if (template != null)
                {
                    htmlHelper.ViewContext.Writer.Write(template(null));
                }
            }
        }

        return new HtmlContentBuilder();
    }

    /// <summary>
    /// Allows TagHelper or backend logic to add stylesheets, supporting deduplication (via key)
    /// </summary>
    public static void AddStyle(this Microsoft.AspNetCore.Http.HttpContext httpContext, string style, string key = null)
    {
        string storageKey = "_style_" + (key ?? Guid.NewGuid().ToString());
        if (httpContext.Items.ContainsKey(storageKey)) return;

        httpContext.Items[storageKey] = new Func<object, HelperResult>(arg => new HelperResult(writer =>
        {
            writer.Write(style);
            return System.Threading.Tasks.Task.CompletedTask;
        }));
    }
}

---

## 4. Mandatory Custom Tag Helper Properties & Asset Management

To ensure consistency, performance, and maintainability across all custom UI components, every custom Tag Helper MUST implement the following properties and logic.

### 4.1 Mandatory Properties

1.  **`asp-for` (Model Binding)**: 
    Support strong typing by including a `ModelExpression` property. This is crucial for retrieving model metadata (Name, Id, Value, Validation) and generating safe HTML identifiers.
    ```csharp
    [HtmlAttributeName("asp-for")]
    public ModelExpression For { get; set; } = null!;
    ```

2.  **CSS Class Handling (UI Class)**: 
    Tag Helpers must provide a default CSS class. If the user provides a custom class in the HTML tag:
    - If the user class is identical to the default, maintain the default.
    - If the user class is different, **append** it to the default class (ensure a space separator).
    
    ```csharp
    [HtmlAttributeName("class")]
    public string? CssClass { get; set; }

    protected void ProcessCssClass(TagHelperOutput output, string defaultClass)
    {
        if (string.IsNullOrEmpty(CssClass))
        {
            output.Attributes.SetAttribute("class", defaultClass);
        }
        else if (CssClass.Trim() == defaultClass)
        {
            output.Attributes.SetAttribute("class", defaultClass);
        }
        else
        {
            output.Attributes.SetAttribute("class", $"{defaultClass} {CssClass.Trim()}");
        }
    }
    ```

3.  **`AutoLoadAssets` (Asset Management)**: 
    Include a boolean property to control automatic resource loading, defaulting to `true`.
    ```csharp
    /// <summary>
    /// Whether to automatically load corresponding JS and CSS. Default is true.
    /// </summary>
    [HtmlAttributeName("auto-load-assets")]
    public bool AutoLoadAssets { get; set; } = true;
    ```

### 4.2 Mandatory Asset Loading Pattern

When `AutoLoadAssets` is `true`, the Tag Helper must register its resources using the following standard pattern:

- **Version Management**: Always use `IFileVersionProvider.AddFileVersionToPath` to ensure browser cache busting.
- **De-duplication & Injection**: Use `HttpContext.AddStyle` and `HttpContext.AddScript` (see Section 3 for implementation) to ensure assets are only rendered once per page.

```csharp
public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
{
    // ... UI Generation Logic ...

    if (AutoLoadAssets)
    {
        var httpContext = ViewContext.HttpContext;
        var requestPathBase = httpContext.Request.PathBase;

        // 1. Resolve Path with Version
        string cssPath = "/css/components/my-component.css";
        string versionedCss = _fileVersionProvider.AddFileVersionToPath(requestPathBase, cssPath);
        
        string jsPath = "/js/components/my-component.js";
        string versionedJs = _fileVersionProvider.AddFileVersionToPath(requestPathBase, jsPath);

        // 2. Register via Context Extensions (renders in designated Layout blocks)
        httpContext.AddStyle($"<link rel=\"stylesheet\" href=\"{versionedCss}\" />", "MyComponentKey");
        httpContext.AddScript($"<script src=\"{versionedJs}\"></script>", "MyComponentKey");
    }
}
```
```
