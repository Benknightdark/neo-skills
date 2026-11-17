#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
MAS App Security Benchmark Update Checker (Non-interactive)
檢查行動應用資安聯盟官網「行動應用App基本資安檢測基準」中文版是否有更新，
並比對本地 references/source-manifest.json 輸出乾淨 JSON 至 stdout。

Exit codes:
  0: Check succeeded (status is "up_to_date" or "update_available")
  1: Invalid arguments or unreadable/invalid local manifest
  2: Network error, HTTP error, or webpage structure parse error (fallback to agent-browser)
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from contextlib import nullcontext
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


USER_AGENT = "neo-mas-app-audit-update-checker/1.0"
DEFAULT_TIMEOUT_SECONDS = 20
ALLOWED_SCHEMES = {"http", "https"}


def log_diagnostic(message: str) -> None:
    """Write diagnostics to stderr so stdout remains clean JSON."""
    print(f"[LOG] {message}", file=sys.stderr)


def validate_http_url(url: str) -> str:
    """Ensure only http/https URLs are fetched."""
    parsed = urllib.parse.urlsplit(url.strip())
    if parsed.scheme.lower() not in ALLOWED_SCHEMES or not parsed.netloc:
        raise ValueError(f"不支援的 URL scheme 或格式: {url}")
    return url.strip()


def normalize_text(text: str) -> str:
    """Normalize NFKC (handles Kangxi radicals like 行 -> 行) and collapse whitespace."""
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", text or "")).strip()


def normalize_url_for_compare(url: str) -> str:
    """Canonicalize URL for comparison, ignoring http vs https on s3.ap-northeast-1.amazonaws.com."""
    parsed = urllib.parse.urlsplit(url.strip())
    scheme = parsed.scheme.lower()
    netloc = parsed.netloc.lower()
    if netloc == "s3.ap-northeast-1.amazonaws.com" and scheme in ("http", "https"):
        scheme = "https"
    return urllib.parse.urlunsplit((scheme, netloc, parsed.path, parsed.query, ""))


def upgrade_fetch_url(url: str) -> str:
    """Prefer HTTPS for Amazon S3 URLs while keeping localhost/custom URLs intact."""
    parsed = urllib.parse.urlsplit(url.strip())
    if parsed.scheme.lower() == "http" and parsed.netloc.lower() == "s3.ap-northeast-1.amazonaws.com":
        return urllib.parse.urlunsplit(("https", parsed.netloc, parsed.path, parsed.query, parsed.fragment))
    return url.strip()


def is_english_entry(text: str, title: str = "") -> bool:
    combined = normalize_text(f"{text} {title}").lower()
    return "英文" in combined or "english" in combined


@dataclass
class LinkInfo:
    text: str
    href: str
    title: str


class MasBenchmarkTableParser(HTMLParser):
    """Parse HTML tables and extract rows and links with rowspan support."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.rows: list[list[dict[str, Any]]] = []
        self.all_links: list[LinkInfo] = []
        self._in_tr = False
        self._in_td = False
        self._current_row: list[dict[str, Any]] = []
        self._current_td: dict[str, Any] | None = None
        self._current_link: dict[str, Any] | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = {k.lower(): (v or "") for k, v in attrs}
        tag = tag.lower()
        if tag == "tr":
            self._in_tr = True
            self._current_row = []
        elif tag in ("td", "th") and self._in_tr:
            self._in_td = True
            try:
                rowspan = max(1, int(attr_map.get("rowspan", "1") or "1"))
            except ValueError:
                rowspan = 1
            self._current_td = {
                "text_parts": [],
                "links": [],
                "rowspan": rowspan,
            }
        elif tag == "a":
            self._current_link = {
                "href": attr_map.get("href", "").strip(),
                "title": attr_map.get("title", "").strip(),
                "text_parts": [],
            }

    def handle_data(self, data: str) -> None:
        if self._in_td and self._current_td is not None:
            self._current_td["text_parts"].append(data)
        if self._current_link is not None:
            self._current_link["text_parts"].append(data)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "a" and self._current_link is not None:
            link = LinkInfo(
                text=normalize_text("".join(self._current_link["text_parts"])),
                href=self._current_link["href"],
                title=normalize_text(self._current_link["title"]),
            )
            if link.href:
                self.all_links.append(link)
                if self._in_td and self._current_td is not None:
                    self._current_td["links"].append(link)
            self._current_link = None
        elif tag in ("td", "th") and self._in_td and self._current_td is not None:
            cell = {
                "text": normalize_text("".join(self._current_td["text_parts"])),
                "links": self._current_td["links"],
                "rowspan": self._current_td["rowspan"],
            }
            self._current_row.append(cell)
            self._in_td = False
            self._current_td = None
        elif tag == "tr" and self._in_tr:
            if self._current_row:
                self.rows.append(self._current_row)
            self._in_tr = False
            self._current_row = []


def extract_benchmark_links(html: str, page_url: str, benchmark_title: str) -> list[LinkInfo]:
    """Find Chinese benchmark links matching benchmark_title in HTML tables or page links."""
    parser = MasBenchmarkTableParser()
    parser.feed(html)
    parser.close()

    normalized_target = normalize_text(benchmark_title)
    group_links: list[LinkInfo] = []

    for pass_require_no_links in (True, False):
        for idx, row in enumerate(parser.rows):
            matched_cell = next(
                (
                    cell
                    for cell in row
                    if normalized_target in cell["text"]
                    and not is_english_entry(cell["text"])
                    and (not pass_require_no_links or not cell["links"])
                ),
                None,
            )
            if matched_cell is not None:
                span = matched_cell["rowspan"]
                for offset in range(span):
                    if idx + offset < len(parser.rows):
                        for cell in parser.rows[idx + offset]:
                            group_links.extend(cell["links"])
                break
        if group_links:
            break

    # Fallback if the table structure changes and title + link appear in any links
    if not group_links:
        group_links = [
            link
            for link in parser.all_links
            if normalized_target in link.text or normalized_target in link.title
        ]

    chinese_links = [
        LinkInfo(
            text=link.text,
            href=urllib.parse.urljoin(page_url, link.href),
            title=link.title,
        )
        for link in group_links
        if not is_english_entry(link.text, link.title)
    ]
    return chinese_links


def version_sort_key(label: str) -> tuple[int, ...]:
    match = re.search(r"V(\d+(?:\.\d+)*)", normalize_text(label), re.IGNORECASE)
    if not match:
        return (0,)
    return tuple(int(part) for part in match.group(1).split("."))


def http_get_text(url: str, timeout: int) -> str:
    safe_url = validate_http_url(url)
    req = urllib.request.Request(safe_url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        validate_http_url(resp.geturl())
        charset = resp.headers.get_content_charset() or "utf-8"
        return resp.read().decode(charset, errors="replace")


def _extract_headers_meta(resp: Any) -> dict[str, Any]:
    resolved_url = validate_http_url(resp.geturl())
    content_len = resp.headers.get("Content-Length")
    return {
        "resolved_url": resolved_url,
        "etag": resp.headers.get("ETag"),
        "last_modified": resp.headers.get("Last-Modified"),
        "content_length": int(content_len) if content_len and content_len.isdigit() else None,
    }


def http_head_metadata(url: str, timeout: int) -> dict[str, Any]:
    fetch_url = upgrade_fetch_url(validate_http_url(url))
    req = urllib.request.Request(fetch_url, method="HEAD", headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return _extract_headers_meta(resp)
    except urllib.error.HTTPError as err:
        if err.code in (403, 405):
            # Fallback to GET headers if server disallows HEAD
            get_req = urllib.request.Request(fetch_url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(get_req, timeout=timeout) as resp:
                return _extract_headers_meta(resp)
        raise


def download_and_hash(url: str, dest_path: Path | None, timeout: int) -> tuple[str, int, str | None]:
    fetch_url = upgrade_fetch_url(validate_http_url(url))
    req = urllib.request.Request(fetch_url, headers={"User-Agent": USER_AGENT})
    hasher = hashlib.sha256()
    total_bytes = 0

    if dest_path is not None:
        dest_path.parent.mkdir(parents=True, exist_ok=True)

    file_ctx = open(dest_path, "wb") if dest_path is not None else nullcontext(None)
    with urllib.request.urlopen(req, timeout=timeout) as resp, file_ctx as out_file:
        validate_http_url(resp.geturl())
        while True:
            chunk = resp.read(65536)
            if not chunk:
                break
            if out_file is not None:
                out_file.write(chunk)
            hasher.update(chunk)
            total_bytes += len(chunk)

    return hasher.hexdigest(), total_bytes, str(dest_path) if dest_path is not None else None


def sanitize_filename(label: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", normalize_text(label)).strip("_")
    if not cleaned:
        cleaned = "mas_benchmark_latest"
    return f"{cleaned}.pdf"


def emit_json(payload: dict[str, Any]) -> None:
    print(json.dumps(payload, indent=2, ensure_ascii=False))


def parse_args() -> argparse.Namespace:
    default_manifest = Path(__file__).resolve().parent.parent / "references" / "source-manifest.json"
    parser = argparse.ArgumentParser(
        description="檢查行動應用資安聯盟官網「行動應用App基本資安檢測基準」中文版是否更新。",
        epilog="使用範例: python3 scripts/check-mas-update.py --download-dir /tmp/mas-check",
    )
    parser.add_argument(
        "--manifest",
        default=str(default_manifest),
        help="本地 source-manifest.json 路徑（預設為 Skill 內建的 references/source-manifest.json）。",
    )
    parser.add_argument(
        "--page-url",
        default=None,
        help="覆寫來源網頁 URL（預設讀取 manifest 內的 source_page_url）。",
    )
    parser.add_argument(
        "--download-dir",
        default=None,
        help="若偵測到更新（或搭配 --verify-hash），將 PDF 下載到此目錄（建議為 OS 暫存目錄）。",
    )
    parser.add_argument(
        "--verify-hash",
        action="store_true",
        help="強制下載 PDF 並驗證完整 SHA-256 雜湊，不僅檢查 HTTP HEAD 標頭。",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=DEFAULT_TIMEOUT_SECONDS,
        help=f"HTTP 請求逾時秒數（預設 {DEFAULT_TIMEOUT_SECONDS} 秒）。",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    if args.timeout <= 0:
        msg = f"--timeout 必須為正整數（目前為 {args.timeout}）"
        log_diagnostic(msg)
        emit_json({"status": "error", "error": msg})
        return 1

    manifest_path = Path(args.manifest)

    if not manifest_path.is_file():
        msg = f"找不到本地 manifest 檔案: {manifest_path}"
        log_diagnostic(msg)
        emit_json({"status": "error", "error": msg})
        return 1

    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except Exception as exc:
        msg = f"無法讀取或解析 manifest JSON ({manifest_path}): {exc}"
        log_diagnostic(msg)
        emit_json({"status": "error", "error": msg})
        return 1

    page_url = args.page_url or manifest.get("source_page_url")
    benchmark_title = manifest.get("benchmark_title", "行動應用App基本資安檢測基準")
    if not page_url:
        msg = "manifest 中缺少 source_page_url。"
        log_diagnostic(msg)
        emit_json({"status": "error", "error": msg})
        return 1

    recorded = {
        "version_label": manifest.get("current_version_label", ""),
        "pdf_url": manifest.get("current_pdf_url", ""),
        "etag": manifest.get("pdf_etag"),
        "last_modified": manifest.get("pdf_last_modified"),
        "content_length": manifest.get("pdf_content_length"),
        "sha256": manifest.get("pdf_sha256"),
    }

    log_diagnostic(f"檢查來源網頁: {page_url}")
    try:
        html = http_get_text(page_url, args.timeout)
    except Exception as exc:
        msg = f"無法連線或讀取來源網頁 ({page_url}): {exc}"
        log_diagnostic(msg)
        emit_json(
            {
                "status": "check_failed",
                "page_url": page_url,
                "recorded": recorded,
                "error": msg,
                "fallback_recommended": "agent-browser",
            }
        )
        return 2

    chinese_links = extract_benchmark_links(html, page_url, benchmark_title)
    if not chinese_links:
        msg = f"網頁中找不到「{benchmark_title}」的中文版下載連結，請改用 agent-browser 人工確認網頁結構是否改版。"
        log_diagnostic(msg)
        emit_json(
            {
                "status": "check_failed",
                "page_url": page_url,
                "recorded": recorded,
                "error": msg,
                "fallback_recommended": "agent-browser",
            }
        )
        return 2

    # Choose highest version if multiple Chinese links exist; preserve order on ties
    best_link = max(chinese_links, key=lambda item: version_sort_key(item.text))
    remote_label = best_link.text
    remote_url = best_link.href

    log_diagnostic(f"偵測到官網中文版項目: {remote_label} -> {remote_url}")

    try:
        head_meta = http_head_metadata(remote_url, args.timeout)
    except Exception as exc:
        msg = f"無法取得遠端 PDF 中繼資料 ({remote_url}): {exc}"
        log_diagnostic(msg)
        emit_json(
            {
                "status": "check_failed",
                "page_url": page_url,
                "recorded": recorded,
                "remote": {"version_label": remote_label, "pdf_url": remote_url},
                "error": msg,
                "fallback_recommended": "agent-browser",
            }
        )
        return 2

    changes: list[str] = []
    if normalize_text(remote_label) != normalize_text(recorded["version_label"]):
        changes.append("version_label_changed")
    if normalize_url_for_compare(remote_url) != normalize_url_for_compare(recorded["pdf_url"]):
        changes.append("pdf_url_changed")
    if recorded["etag"] and head_meta.get("etag") and head_meta["etag"] != recorded["etag"]:
        changes.append("pdf_etag_changed")
    if (
        recorded["last_modified"]
        and head_meta.get("last_modified")
        and head_meta["last_modified"] != recorded["last_modified"]
    ):
        changes.append("pdf_last_modified_changed")
    if (
        recorded["content_length"] is not None
        and head_meta.get("content_length") is not None
        and head_meta["content_length"] != recorded["content_length"]
    ):
        changes.append("pdf_content_length_changed")

    remote_sha256: str | None = None
    downloaded_pdf_path: str | None = None

    if changes or args.verify_hash:
        dest_file: Path | None = None
        if args.download_dir:
            dest_file = Path(args.download_dir) / sanitize_filename(remote_label)
        try:
            remote_sha256, downloaded_bytes, downloaded_pdf_path = download_and_hash(
                remote_url, dest_file, args.timeout
            )
            if head_meta.get("content_length") is None:
                head_meta["content_length"] = downloaded_bytes
            if recorded["sha256"] and remote_sha256 != recorded["sha256"] and "pdf_sha256_changed" not in changes:
                changes.append("pdf_sha256_changed")
        except Exception as exc:
            msg = f"下載或計算遠端 PDF 雜湊失敗 ({remote_url}): {exc}"
            log_diagnostic(msg)
            emit_json(
                {
                    "status": "check_failed",
                    "page_url": page_url,
                    "recorded": recorded,
                    "remote": {
                        "version_label": remote_label,
                        "pdf_url": remote_url,
                        "etag": head_meta.get("etag"),
                        "last_modified": head_meta.get("last_modified"),
                        "content_length": head_meta.get("content_length"),
                    },
                    "error": msg,
                    "fallback_recommended": "agent-browser",
                }
            )
            return 2

    status = "update_available" if changes else "up_to_date"
    log_diagnostic(f"檢查完成，狀態: {status}")

    emit_json(
        {
            "status": status,
            "page_url": page_url,
            "recorded": recorded,
            "remote": {
                "version_label": remote_label,
                "pdf_url": remote_url,
                "etag": head_meta.get("etag"),
                "last_modified": head_meta.get("last_modified"),
                "content_length": head_meta.get("content_length"),
                "sha256": remote_sha256,
            },
            "all_chinese_links": [
                {"version_label": link.text, "pdf_url": link.href} for link in chinese_links
            ],
            "changes": changes,
            "downloaded_pdf_path": downloaded_pdf_path,
        }
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
