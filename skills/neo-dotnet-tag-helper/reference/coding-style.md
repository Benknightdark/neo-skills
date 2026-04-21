# .NET Tag Helper Coding Style & Advanced Patterns

這份指南定義了 ASP.NET Core Tag Helper 的進階程式碼風格與實作模式，特別針對複雜 UI 組件、擴充內建行為以及前端資源的管理機制。

## 1. 繼承與擴充內建 Tag Helper

當需要客製化標準表單元素（如 `<select>`）時，應優先考慮繼承內建的 Tag Helper（如 `SelectTagHelper`）。這樣可以保留官方對於 `id`、`name` 的生成邏輯以及強型別的模型驗證（`data-val-*`）支援。

### 實作要點：
- 建構子必須注入基礎類別所需的依賴（例如 `IHtmlGenerator`）。
- 必須明確設定 `output.TagName`，否則網頁會輸出帶有自定義名稱的標籤（如 `<select-ai-agent>`）。
- 呼叫 `await base.ProcessAsync(context, output)` 讓底層處理原生屬性綁定。

### 範例：擴充下拉選單
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

namespace Weleader.Extensions.TagHelpers
{
    public abstract class BaseSelectTagHelper : SelectTagHelper
    {
        public BaseSelectTagHelper(IHtmlGenerator generator) : base(generator)
        {
        }

        /// <summary>
        /// 手動指定的資料列表或模型 (對應 asp-model，由子類別決定如何使用)
        /// </summary>
        [HtmlAttributeName("asp-model")]
        public object? AspModel { get; set; }

        /// <summary>
        /// 預設提示文字 (例如: -- 請選擇 --)
        /// </summary>
        [HtmlAttributeName("placeholder")]
        public string? Placeholder { get; set; }

        public override async Task ProcessAsync(TagHelperContext context, TagHelperOutput output)
        {
            // 必須明確設定 TagName 為 "select"，否則瀏覽器會輸出自訂標籤名稱 (如 <select-ai-agent>)
            output.TagName = "select";
            output.TagMode = TagMode.StartTagAndEndTag;

            // 讓 SelectTagHelper 處理基本屬性 (ID, Name, Validation)
            // 注意：SelectTagHelper 預設會產生 id, name, class(若有驗證錯誤), data-val-* 屬性
            await base.ProcessAsync(context, output);

            // 設定 class，如果沒有指定則預設使用 form-control
            var existingClass = output.Attributes["class"]?.Value?.ToString();
            if (string.IsNullOrEmpty(existingClass))
            {
                output.Attributes.SetAttribute("class", "form-control");
            }
            else // if (!existingClass.Contains("form-control"))
            {
                output.Attributes.SetAttribute("class", $"{existingClass} form-control");
            }
            
            // 如果有設定 Placeholder，先加入預設選項
            if (Placeholder != null)
            {
                var placeholder = Placeholder.Trim();
                output.Content.AppendHtml($"<option value=''>{placeholder}</option>");
            }

            // 保留原本的 foreach 生成邏輯
            await GenerateOptionsAsync(output);
        }

        /// <summary>
        /// 產生選項的抽象方法，由子類別實作
        /// </summary>
        protected abstract Task GenerateOptionsAsync(TagHelperOutput output);
    }

    /// <summary>
    /// AI Agent 下拉選單
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
        /// 是否過濾啟用狀態 (null: 全部, true: 僅啟用, false: 僅停用)
        /// </summary>
        [HtmlAttributeName("enabled")]
        public bool? Enabled { get; set; } = null;

        /// <summary>
        /// 產生下拉選單選項
        /// </summary>
        /// <param name="output">TagHelper 輸出</param>
        protected override async Task GenerateOptionsAsync(TagHelperOutput output)
        {
            // 取得目前選中的值
            Guid? selectedValue = For?.Model switch
            {
                Guid g => g,
                string s when Guid.TryParse(s, out var g) => g,
                _ => null
            };

            IEnumerable<AIAgentSimpleDto>? agents;

            if (AspModel != null)
            {
                // 若有指定手動模型，則不允許再設定 enabled 篩選屬性
                if (Enabled.HasValue)
                {
                    throw new InvalidOperationException("當指定 'asp-model' 時，不能使用 'enabled' 屬性。");
                }

                // 驗證手動模型型別
                agents = AspModel as IEnumerable<AIAgentSimpleDto>;
                if (agents == null)
                {
                    throw new InvalidOperationException("'asp-model' 屬性的型別必須為 IEnumerable<AIAgentSimpleDto>。");
                }
            }
            else if (Enabled == true && selectedValue.HasValue)
            {
                // 特殊邏輯：若要求僅顯示啟用中的代理，但當前選中的值卻是停用中的，則需額外將其加入列表
                var allAgents = await _aiAnalysisHelper.GetAIAgents(null);
                var selectedAgent = allAgents?.FirstOrDefault(a => a.ID == selectedValue.Value);

                if (selectedAgent != null && selectedAgent.Enabled != true)
                {
                    // 已停用且被選中：加上 (已停用) 並置頂，其餘僅顯示啟用的
                    var filteredAgents = new List<AIAgentSimpleDto> { selectedAgent };
                    filteredAgents.AddRange(allAgents.Where(a => a.Enabled == true && a.ID != selectedValue.Value));
                    agents = filteredAgents;
                }
                else
                {
                    // 未停用或未找到：僅顯示啟用的
                    agents = allAgents?.Where(a => a.Enabled == true);
                }
            }
            else
            {
                // 一般情況：依據 Enabled 屬性向 Service 取得資料
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

## 2. 組合式複雜 UI 組件與模型繫結 (ModelBinding)

對於包含多個元素的複雜 UI（如完整的搜尋表單），應使用 `TagBuilder` 組合 DOM 結構。使用 `ModelExpression` 可以將 Tag Helper 屬性精確綁定到 ViewModel 屬性，獲取準確的欄位名稱 (`.Name`) 用於前端，並可整合後端權限驗證邏輯。

### 範例：組合式搜尋列
```csharp
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
            output.Attributes.SetAttribute("class", "ai-report-search-container");

            // 產生日選單與按鈕的 ID (使用 CreateSanitizedId 確保 ID 在前端選擇器中安全無誤)
            string sDateId = TagBuilder.CreateSanitizedId(ForSDate.Name, "_");
            string eDateId = TagBuilder.CreateSanitizedId(ForEDate.Name, "_");
            string buId = ForBusinessUnit != null ? TagBuilder.CreateSanitizedId(ForBusinessUnit.Name, "_") : "Search_BusinessUnit";
            string hisNoId = TagBuilder.CreateSanitizedId(ForHISNo.Name, "_");
            string reportId = TagBuilder.CreateSanitizedId(ForAIReport.Name, "_");
            string btnId = "btnSearchAIReport";

            var inputGroup = new TagBuilder("div");
            inputGroup.AddCssClass("input-group");

            // 1. 開始日期 (產生標籤與輸入框)
            inputGroup.InnerHtml.AppendHtml(CreateSpan("日期"));
            inputGroup.InnerHtml.AppendHtml(CreateInput(sDateId, "date", SDateClass, DateTime.Now.ToString("yyyy-MM-dd"), "開始日期"));

            // 2. 結束日期
            inputGroup.InnerHtml.AppendHtml(CreateSpan("至"));
            inputGroup.InnerHtml.AppendHtml(CreateInput(eDateId, "date", EDateClass, DateTime.Now.ToString("yyyy-MM-dd"), "結束日期"));

            // 3. 檢驗單位 (僅超級管理員可見)
            if (isSuperAdmin)
            {
                inputGroup.InnerHtml.AppendHtml(CreateSpan("檢驗單位"));
                inputGroup.InnerHtml.AppendHtml(CreateSelect(buId, BusinessUnitClass));
            }

            // 4. 送檢單位 (依權限自動過濾或初始化)
            inputGroup.InnerHtml.AppendHtml(CreateSpan("送檢單位"));
            var hisNoSelect = CreateSelect(hisNoId, HISNoClass);
            if (!isSuperAdmin)
            {
                // 非超級管理員：預先從資料庫抓取授權的組織清單並填充下拉選單
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

            // 5. 檢驗報告 (預設為空，由 JS 透過 API 非同步填充)
            inputGroup.InnerHtml.AppendHtml(CreateSpan("檢驗報告"));
            var reportSelect = CreateSelect(reportId, AIReportClass);
            reportSelect.InnerHtml.AppendHtml("<option></option>");
            inputGroup.InnerHtml.AppendHtml(reportSelect);

            // 6. 查詢按鈕
            var btn = new TagBuilder("button");
            btn.Attributes.Add("type", "button");
            btn.Attributes.Add("id", btnId);
            btn.AddCssClass(BtnClass);
            btn.InnerHtml.AppendHtml("<i class='fa fa-search'></i> 查詢");
            inputGroup.InnerHtml.AppendHtml(btn);

            output.Content.SetHtmlContent(inputGroup);

            // 自動載入資產 (整合專案既有的資產收集器模式)
            if (AutoLoadAssets)
            {
                var httpContext = ViewContext.HttpContext;
                
                // 1. 載入 CSS (推送到 Layout 的 RenderStyles 處理)
                string cssPath = "/css/AIAnalysis/ComboAIReportSearch.css";
                string vCssPath = _fileVersionProvider.AddFileVersionToPath(httpContext.Request.PathBase, cssPath);
                httpContext.AddStyle($"<link rel=\"stylesheet\" href=\"{vCssPath}\" />", "ComboAIReportSearch");

                // 2. 載入 JS (推送到 Layout 的 RenderScripts 處理)
                string jsPath = "/js/AIAnalysis/ComboAIReportSearch.js";
                string vJsPath = _fileVersionProvider.AddFileVersionToPath(httpContext.Request.PathBase, jsPath);
                httpContext.AddScript($"<script src=\"{vJsPath}\"></script>", "ComboAIReportSearch");
            }
        }

        #region Helper Methods (用於產生 TagBuilder 元素)
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

---

## 3. 前端資源自動載入與去重 (Asset Management)

當 Tag Helper 依賴專屬的 JavaScript 或 CSS 時，開發者應確保同一個頁面多次使用該標籤時，這些資源不會被重複載入。推薦透過擴充 `HttpContext.Items` 實作資源收集器模式。

### 範例：資源去重擴充方法

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
    /// 供 TagHelper 或後端邏輯加入腳本，支援去重 (透過 key)
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
    /// 供 TagHelper 或後端邏輯加入樣式表，支援去重 (透過 key)
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
```
