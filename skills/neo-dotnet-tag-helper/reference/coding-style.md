# .NET Tag Helper Coding Style & Advanced Patterns

This guide defines advanced coding styles and implementation patterns for ASP.NET Core Tag Helpers, specifically targeting complex UI components, extending built-in behaviors, and frontend asset management mechanisms. **When developing Tag Helpers, developers MUST refer to the implementation patterns in the Example section (Section 3) to ensure adherence to these standards.**

## 1. Inheriting and Extending Built-in Tag Helpers

When you need to customize standard form elements (e.g., `<select>`), you should prioritize inheriting from built-in Tag Helpers (e.g., `SelectTagHelper`). This allows you to retain official logic for `id` and `name` generation, as well as support for strongly-typed model validation (`data-val-*`).

### Implementation Key Points:
- The constructor must inject the dependencies required by the base class (e.g., `IHtmlGenerator`).
- You must explicitly set `output.TagName`; otherwise, the browser will output tags with custom names (e.g., `<select-ai-agent>`).
- Call `await base.ProcessAsync(context, output)` to allow the base class to handle native attribute binding.

## 2. Mandatory Custom Tag Helper Properties & Asset Management

To ensure consistency, performance, and maintainability across all custom UI components, every custom Tag Helper MUST implement the following properties and logic.

### 2.1 Mandatory Properties

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

### 2.2 Inheritance and Composition Standards

1.  **Independent Tag Helpers**: Any standalone custom Tag Helper representing a single UI control (e.g., a specialized dropdown) MUST inherit from the corresponding built-in ASP.NET Core Tag Helper (e.g., `SelectTagHelper`, `InputTagHelper`, `RadioTagHelper`). This leverages framework-standard model binding and validation logic.

2.  **Composite Tag Helpers**: For components aggregating multiple elements (e.g., a search form):
    - **Internal Elements**: MUST be implemented using built-in C# UI Tag Helpers to ensure they benefit from standard ASP.NET Core features.
    - **Outer Container (`div-class`)**: MUST allow users to pass a custom CSS class via a `div-class` attribute.
    - **CSS Consistency**: The handling of `div-class` MUST strictly follow the rules defined in **Section 2.1.2 (CSS Class Handling)**, ensuring the default container class is preserved or appended to, rather than simply overwritten.

### 2.3 Mandatory Asset Loading Pattern

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



## 3 Example

### Extending a Dropdown

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
```

### Composite Complex UI Components and Model Binding

For complex UIs containing multiple elements (like a complete search form), you should use `TagBuilder` to compose the DOM structure. Using `ModelExpression` allows you to accurately bind Tag Helper attributes to ViewModel properties, retrieve the exact field name (`.Name`) for the frontend, and integrate backend permission validation logic.

``` csharp

    /// <summary>
    /// Composite AI Report Search TagHelper.
    /// A UI component integrating date range, business unit, submission unit, inspection report menu, and search button.
    /// </summary>
    /// <summary>
    /// 組合式 AI 報告搜尋 TagHelper
    /// 整合了日期範圍、檢驗單位、送檢單位、檢驗報告選單與查詢按鈕的 UI 組件
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
        /// 是否自動載入對應的 JS 與 CSS，預設為 true
        /// 若設定為 true，TagHelper 會自動在組件後方插入相關資源標籤，並確保單次請求僅載入一次
        /// </summary>
        [HtmlAttributeName("auto-load-assets")]
        public bool AutoLoadAssets { get; set; } = true;

        #region Model Binding Attributes (支援自定義 ID 與 Name)
        /// <summary>
        /// 繫結開始日期的模型表達式
        /// </summary>
        [HtmlAttributeName("asp-for-sdate")]
        public ModelExpression ForSDate { get; set; }

        /// <summary>
        /// 繫結結束日期的模型表達式
        /// </summary>
        [HtmlAttributeName("asp-for-edate")]
        public ModelExpression ForEDate { get; set; }

        /// <summary>
        /// 繫結檢驗單位的模型表達式
        /// </summary>
        [HtmlAttributeName("asp-for-bu")]
        public ModelExpression ForBusinessUnit { get; set; }

        /// <summary>
        /// 繫結送檢單位的模型表達式
        /// </summary>
        [HtmlAttributeName("asp-for-hisno")]
        public ModelExpression ForHISNo { get; set; }

        /// <summary>
        /// 繫結檢驗報告的模型表達式
        /// </summary>
        [HtmlAttributeName("asp-for-report")]
        public ModelExpression ForAIReport { get; set; }
        #endregion

        #region Class Attributes (支援 CSS 客製化)
        [HtmlAttributeName("sdate-class")]
        public string SDateClass { get; set; } = "sdate-li77"; // form-control 要預設有

        [HtmlAttributeName("edate-class")]
        public string EDateClass { get; set; } = "edate-li77"; // form-control 要預設有

        [HtmlAttributeName("bu-class")]
        public string BusinessUnitClass { get; set; } = "bu-li77"; // form-control 要預設有

        [HtmlAttributeName("hisno-class")]
        public string HISNoClass { get; set; } = "hisno-li77"; // form-control 要預設有

        [HtmlAttributeName("report-class")]
        public string AIReportClass { get; set; } = "ai-report-li77"; // form-control 要預設有

        [HtmlAttributeName("btn-class")]
        public string BtnClass { get; set; } = "ai-btn-search-li77"; // btn btn-primary 要預設有

        /// <summary>
        /// 外層容器的 CSS Class。預設為 ai-report-search-container-li77
        /// </summary>
        [HtmlAttributeName("div-class")]
        public string ContainerClass { get; set; } = "ai-report-search-container-li77";
        #endregion

        /// <summary>
        /// 取得目前的 ViewContext 以存取 HttpContext 等資訊
        /// </summary>
        [HtmlAttributeNotBound]
        [ViewContext]
        public ViewContext ViewContext { get; set; }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            var currentUser = _commonService.GetUserInfo();
            var currentDT = _commonService.GetCurrentDateTime();
            var isSuperAdmin = currentUser.IsSuperAdminRole;

            // 設定外層容器
            output.TagName = "div";
            output.TagMode = TagMode.StartTagAndEndTag;

            // 處理自訂容器 Class，如果使用者自訂了，則把自訂的加在前面，並且保留預設的以便 JS 定位
            string finalContainerClass = ContainerClass == "ai-report-search-container-li77"
                ? "ai-report-search-container-li77"
                : $"{ContainerClass} ai-report-search-container-li77";

            output.Attributes.SetAttribute("class", finalContainerClass);

            // 產生日選單與按鈕的 ID (一律使用 TagBuilder.CreateSanitizedId 產生)
            string sDateId = TagBuilder.CreateSanitizedId(ForSDate?.Name ?? "Search_SDate", "_");
            string eDateId = TagBuilder.CreateSanitizedId(ForEDate?.Name ?? "Search_EDate", "_");
            string buId = TagBuilder.CreateSanitizedId(ForBusinessUnit?.Name ?? "Search_BusinessUnit", "_");
            string hisNoId = TagBuilder.CreateSanitizedId(ForHISNo?.Name ?? "Search_HISNo", "_");
            string reportId = TagBuilder.CreateSanitizedId(ForAIReport?.Name ?? "Search_AIReport", "_");

            // 處理內層元素的 CSS Class，確保基底 class (form-control / btn btn-primary) 加上自定義或預設的 class
            string finalSDateClass = SDateClass == "sdate-li77" ? "form-control sdate-li77" : $"form-control {SDateClass} sdate-li77";
            string finalEDateClass = EDateClass == "edate-li77" ? "form-control edate-li77" : $"form-control {EDateClass} edate-li77";
            string finalBUClass = BusinessUnitClass == "bu-li77" ? "form-control bu-li77" : $"form-control {BusinessUnitClass} bu-li77";
            string finalHISNoClass = HISNoClass == "hisno-li77" ? "form-control hisno-li77" : $"form-control {HISNoClass} hisno-li77";
            string finalReportClass = AIReportClass == "ai-report-li77" ? "form-control ai-report-li77" : $"form-control {AIReportClass} ai-report-li77";
            string finalBtnClass = BtnClass == "ai-btn-search-li77" ? "btn btn-primary ai-btn-search-li77" : $"btn btn-primary {BtnClass} ai-btn-search-li77";

            var inputGroup = new TagBuilder("div");
            inputGroup.AddCssClass("input-group");

            // 1. 開始日期
            inputGroup.InnerHtml.AppendHtml(CreateSpan("日期"));
            inputGroup.InnerHtml.AppendHtml(await CreateUIAsync(ForSDate, "date", finalSDateClass, DateTime.Now.ToString("yyyy-MM-dd"), "開始日期", sDateId));

            // 2. 結束日期
            inputGroup.InnerHtml.AppendHtml(CreateSpan("至"));
            inputGroup.InnerHtml.AppendHtml(await CreateUIAsync(ForEDate, "date", finalEDateClass, DateTime.Now.ToString("yyyy-MM-dd"), "結束日期", eDateId));

            // 3. 檢驗單位 (僅超級管理員可見)
            if (isSuperAdmin)
            {
                inputGroup.InnerHtml.AppendHtml(CreateSpan("檢驗單位"));
                inputGroup.InnerHtml.AppendHtml(await CreateUIAsync(ForBusinessUnit, null, finalBUClass, null, null, buId));
            }

            // 4. 送檢單位 (依權限自動過濾或初始化)
            inputGroup.InnerHtml.AppendHtml(CreateSpan("送檢單位"));
            
            List<SelectListItem> hisNoOptions = new List<SelectListItem>();
            if (!isSuperAdmin)
            {
                // 非超級管理員：預先從資料庫抓取授權的組織清單
                hisNoOptions.Add(new SelectListItem { Text = "", Value = "" });
                var options = await GetAllowListOptionsAsync(currentUser.UserID, currentDT);
                hisNoOptions.AddRange(options);
            }
            inputGroup.InnerHtml.AppendHtml(await CreateUIAsync(ForHISNo, null, finalHISNoClass, null, null, hisNoId, hisNoOptions));

            // 5. 檢驗報告 (預設為空，由 JS 透過 API 非同步填充)
            inputGroup.InnerHtml.AppendHtml(CreateSpan("檢驗報告"));
            var reportOptions = new List<SelectListItem> { new SelectListItem { Text = "", Value = "" } };
            inputGroup.InnerHtml.AppendHtml(await CreateUIAsync(ForAIReport, null, finalReportClass, null, null, reportId, reportOptions));

            // 6. 查詢按鈕
            var btn = new TagBuilder("button");
            btn.Attributes.Add("type", "button");
            btn.AddCssClass(finalBtnClass);
            btn.InnerHtml.AppendHtml("<i class='fa fa-search'></i> 查詢");
            inputGroup.InnerHtml.AppendHtml(btn);

            output.Content.SetHtmlContent(inputGroup);

            // 自動載入資產
            if (AutoLoadAssets)
            {
                var httpContext = ViewContext.HttpContext;
                
                string cssPath = "/css/AIAnalysis/ComboAIReportSearch.css";
                string vCssPath = _fileVersionProvider.AddFileVersionToPath(httpContext.Request.PathBase, cssPath);
                httpContext.AddStyle($"<link rel=\"stylesheet\" href=\"{vCssPath}\" />", "ComboAIReportSearch");

                string jsPath = "/js/AIAnalysis/ComboAIReportSearch.js";
                string vJsPath = _fileVersionProvider.AddFileVersionToPath(httpContext.Request.PathBase, jsPath);
                httpContext.AddScript($"<script src=\"{vJsPath}\"></script>", "ComboAIReportSearch");
            }
        }

        #region Helper Methods

        private TagBuilder CreateSpan(string text)
        {
            var span = new TagBuilder("span");
            span.AddCssClass("input-group-text");
            span.InnerHtml.Append(text);
            return span;
        }

        /// <summary>
        /// 通用 UI 產生方法，根據是否有 ModelExpression 選擇產生方式
        /// </summary>
        private async Task<IHtmlContent> CreateUIAsync(ModelExpression @for, string type, string className, string value, string title, string sanitizedId, IEnumerable<SelectListItem> items = null)
        {
            // 如果有 ModelExpression，使用原生 TagHelper 物件
            if (@for != null)
            {
                if (string.IsNullOrEmpty(type)) // Select
                {
                    return await CreateSelectTagHelperAsync(@for, className, sanitizedId, items);
                }
                else // Input
                {
                    return await CreateInputTagHelperAsync(@for, type, className, value, title, sanitizedId);
                }
            }

            // 如果沒有 ModelExpression，使用 IHtmlGenerator 直接產生 (模擬 TagHelper 行為)
            if (string.IsNullOrEmpty(type)) // Select
            {
                var select = _generator.GenerateSelect(
                    ViewContext,
                    null,
                    sanitizedId,
                    sanitizedId,
                    items ?? new List<SelectListItem>(),
                    false,
                    new { @class = className, id = sanitizedId });
                return select;
            }
            else // Input
            {
                var input = _generator.GenerateTextBox(
                    ViewContext,
                    null,
                    sanitizedId,
                    value,
                    null,
                    new { @class = className, id = sanitizedId, type = type, title = title });
                return input;
            }
        }

        /// <summary>
        /// 使用 InputTagHelper 產生輸入框
        /// </summary>
        private async Task<IHtmlContent> CreateInputTagHelperAsync(ModelExpression @for, string type, string className, string value, string title, string sanitizedId)
        {
            var inputTagHelper = new InputTagHelper(_generator)
            {
                For = @for,
                InputTypeName = type,
                ViewContext = this.ViewContext
            };

            var output = new TagHelperOutput(
                "input",
                new TagHelperAttributeList(),
                (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent())
            );

            output.Attributes.SetAttribute("id", sanitizedId);
            if (!string.IsNullOrEmpty(className)) output.Attributes.SetAttribute("class", className);
            if (!string.IsNullOrEmpty(value)) output.Attributes.SetAttribute("value", value);
            if (!string.IsNullOrEmpty(title)) output.Attributes.SetAttribute("title", title);

            await inputTagHelper.ProcessAsync(new TagHelperContext(new TagHelperAttributeList(), new Dictionary<object, object>(), Guid.NewGuid().ToString()), output);
            return output;
        }

        /// <summary>
        /// 使用 SelectTagHelper 產生下拉選單
        /// </summary>
        private async Task<IHtmlContent> CreateSelectTagHelperAsync(ModelExpression @for, string className, string sanitizedId, IEnumerable<SelectListItem> items = null)
        {
            var selectTagHelper = new SelectTagHelper(_generator)
            {
                For = @for,
                Items = items ?? new List<SelectListItem>(),
                ViewContext = this.ViewContext
            };

            var output = new TagHelperOutput(
                "select",
                new TagHelperAttributeList(),
                (useCachedResult, encoder) => Task.FromResult<TagHelperContent>(new DefaultTagHelperContent())
            );

            output.Attributes.SetAttribute("id", sanitizedId);
            if (!string.IsNullOrEmpty(className)) output.Attributes.SetAttribute("class", className);

            await selectTagHelper.ProcessAsync(new TagHelperContext(new TagHelperAttributeList(), new Dictionary<object, object>(), Guid.NewGuid().ToString()), output);
            return output;
        }
        #endregion

        /// <summary>
        /// 獲取當前使用者被授權的所有送檢機構列表
        /// </summary>
        private async Task<List<SelectListItem>> GetAllowListOptionsAsync(string userId, DateTime currentDT)
        {
            var authOrgs = await _aiAnalysisHelper.GetAuthorizedOrganizationsAsync(userId, currentDT);
            return authOrgs.Select(x => new SelectListItem
            {
                Value = x.HisNo,
                Text = $"【{x.HisNo}】 {x.OrgName}"
            }).ToList();
        }
    }

```


### Automatic Frontend Asset Loading and Deduplication (Asset Management)

When a Tag Helper depends on specific JavaScript or CSS, developers must ensure that these resources are not loaded multiple times if the tag is used repeatedly on the same page. It is recommended to implement an asset collector pattern by extending `HttpContext.Items`.


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


