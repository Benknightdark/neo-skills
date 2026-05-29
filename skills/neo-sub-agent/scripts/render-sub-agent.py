#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""Render cross-client sub-agent files from a JSON spec.

Diagnostics go to stderr. JSON output goes to stdout.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any


CLIENT_ALIASES = {
    "claude": "claude",
    "claude-code": "claude",
    "codex": "codex",
    "copilot": "copilot",
    "copilot-cli": "copilot",
    "agy": "agy",
    "antigravity": "agy",
    "antigravity-cli": "agy",
}

ALL_CLIENTS = ["claude", "codex", "copilot", "agy"]
SAFE_NAME_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


class SpecError(ValueError):
    """Raised when the input spec is invalid."""


def log(message: str) -> None:
    print(message, file=sys.stderr)


def read_json(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise SpecError(f"spec file not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise SpecError(f"spec is not valid JSON: {exc}") from exc

    if not isinstance(data, dict):
        raise SpecError("spec root must be a JSON object")
    return data


def normalize_clients(value: Any) -> list[str]:
    if value is None:
        raise SpecError("spec.clients is required")
    raw = value if isinstance(value, list) else [value]
    clients: list[str] = []
    for item in raw:
        if not isinstance(item, str):
            raise SpecError("spec.clients must contain strings")
        key = item.strip().lower()
        if key == "all":
            for client in ALL_CLIENTS:
                if client not in clients:
                    clients.append(client)
            continue
        client = CLIENT_ALIASES.get(key)
        if not client:
            raise SpecError(f"unsupported client: {item}")
        if client not in clients:
            clients.append(client)
    if not clients:
        raise SpecError("spec.clients must not be empty")
    return clients


def validate_spec(spec: dict[str, Any]) -> dict[str, Any]:
    name = spec.get("name")
    description = spec.get("description")
    instructions = (
        spec.get("instructions")
        or spec.get("prompt")
        or spec.get("developer_instructions")
    )
    if not isinstance(name, str) or not name:
        raise SpecError("spec.name is required")
    if len(name) > 64 or not SAFE_NAME_RE.match(name):
        raise SpecError("spec.name must be lowercase kebab-case, 1-64 chars")
    if not isinstance(description, str) or not description.strip():
        raise SpecError("spec.description is required")
    if len(description) > 1024:
        raise SpecError("spec.description must be 1024 chars or less")
    if not isinstance(instructions, str) or not instructions.strip():
        raise SpecError("spec.instructions is required")

    scope = spec.get("scope", "project")
    if scope not in ("project", "user"):
        raise SpecError("spec.scope must be 'project' or 'user'")

    normalized = dict(spec)
    normalized["clients"] = normalize_clients(spec.get("clients"))
    normalized["scope"] = scope
    normalized["instructions"] = instructions.strip()
    normalized["description"] = description.strip()
    normalized["name"] = name
    return normalized


def json_yaml(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (list, dict)):
        return json.dumps(value, ensure_ascii=False)
    if isinstance(value, (int, float)):
        return str(value)
    return json.dumps(str(value), ensure_ascii=False)


def yaml_frontmatter(fields: list[tuple[str, Any]]) -> str:
    lines = []
    for key, value in fields:
        if value is None:
            continue
        if value == [] or value == {}:
            lines.append(f"{key}: {json_yaml(value)}")
            continue
        if value == "":
            continue
        lines.append(f"{key}: {json_yaml(value)}")
    return "\n".join(lines)


def toml_value(value: Any) -> str:
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    if isinstance(value, list):
        return json.dumps(value, ensure_ascii=False)
    return json.dumps(str(value), ensure_ascii=False)


def toml_document(fields: list[tuple[str, Any]], tables: dict[str, Any] | None = None) -> str:
    lines = []
    for key, value in fields:
        if value is None or value == "":
            continue
        lines.append(f"{key} = {toml_value(value)}")

    if tables:
        for table_name, table_value in tables.items():
            if not isinstance(table_value, dict):
                continue
            lines.append("")
            lines.append(f"[mcp_servers.{table_name}]")
            for key, value in table_value.items():
                if isinstance(value, dict):
                    log(f"skipping nested mcp_servers.{table_name}.{key}; render manually")
                    continue
                lines.append(f"{key} = {toml_value(value)}")
    return "\n".join(lines) + "\n"


def template(name: str) -> str:
    root = Path(__file__).resolve().parents[1]
    return (root / "assets" / "templates" / name).read_text(encoding="utf-8")


def get_tools(spec: dict[str, Any], client: str) -> Any:
    tools = spec.get("tools")
    if tools is None:
        return None
    if isinstance(tools, dict):
        return tools.get(client) or tools.get("default")
    return tools


def output_contract(spec: dict[str, Any]) -> str:
    value = spec.get("output_contract")
    if isinstance(value, list):
        return "\n".join(f"- {item}" for item in value)
    if isinstance(value, str) and value.strip():
        return value.strip()
    return "- Summary\n- Evidence or changed files\n- Risks\n- Suggested next steps"


def validation(spec: dict[str, Any]) -> str:
    value = spec.get("validation")
    if isinstance(value, list):
        return "\n".join(f"- `{item}`" for item in value)
    if isinstance(value, str) and value.strip():
        return f"- `{value.strip()}`"
    return "- State any checks run. If no deterministic check is available, say so explicitly."


def target_path(client: str, spec: dict[str, Any], output_root: Path) -> Path:
    name = spec["name"]
    scope = spec["scope"]
    if scope == "user":
        home = Path.home()
        if client == "claude":
            return home / ".claude" / "agents" / f"{name}.md"
        if client == "codex":
            return home / ".codex" / "agents" / f"{name}.toml"
        if client == "copilot":
            return home / ".copilot" / "agents" / f"{name}.agent.md"
        if client == "agy":
            return home / ".gemini" / "antigravity-cli" / "skills" / name / "SKILL.md"

    if client == "claude":
        return output_root / ".claude" / "agents" / f"{name}.md"
    if client == "codex":
        return output_root / ".codex" / "agents" / f"{name}.toml"
    if client == "copilot":
        return output_root / ".github" / "agents" / f"{name}.agent.md"
    if client == "agy":
        return output_root / ".agents" / "skills" / name / "SKILL.md"
    raise SpecError(f"unsupported client: {client}")


def render_claude(spec: dict[str, Any]) -> str:
    fm = yaml_frontmatter(
        [
            ("name", spec["name"]),
            ("description", spec["description"]),
            ("tools", get_tools(spec, "claude")),
            ("disallowedTools", spec.get("disallowed_tools") or spec.get("disallowedTools")),
            ("model", spec.get("model")),
            ("permissionMode", spec.get("permission_mode") or spec.get("permissionMode")),
            ("maxTurns", spec.get("max_turns") or spec.get("maxTurns")),
            ("skills", spec.get("skills")),
            ("mcpServers", spec.get("mcp_servers") or spec.get("mcpServers")),
            ("memory", spec.get("memory")),
            ("background", spec.get("background")),
            ("effort", spec.get("effort")),
            ("isolation", spec.get("isolation")),
            ("color", spec.get("color")),
        ]
    )
    return template("claude-agent.md").replace("{{frontmatter}}", fm).replace(
        "{{instructions}}", spec["instructions"]
    )


def render_codex(spec: dict[str, Any]) -> str:
    sandbox_mode = spec.get("sandbox_mode")
    if sandbox_mode is None and spec.get("read_only"):
        sandbox_mode = "read-only"
    doc = toml_document(
        [
            ("name", spec["name"].replace("-", "_") if spec.get("codex_use_underscores") else spec["name"]),
            ("description", spec["description"]),
            ("model", spec.get("model")),
            ("model_reasoning_effort", spec.get("model_reasoning_effort")),
            ("sandbox_mode", sandbox_mode),
            ("developer_instructions", spec["instructions"]),
            ("nickname_candidates", spec.get("nickname_candidates")),
        ],
        spec.get("mcp_servers"),
    )
    return template("codex-agent.toml").replace("{{toml}}", doc)


def render_copilot(spec: dict[str, Any]) -> str:
    disable_model_invocation = spec.get("disable_model_invocation")
    if disable_model_invocation is None and spec.get("auto_delegate") is False:
        disable_model_invocation = True
    fm = yaml_frontmatter(
        [
            ("name", spec.get("display_name") or spec["name"]),
            ("description", spec["description"]),
            ("target", spec.get("target")),
            ("tools", get_tools(spec, "copilot")),
            ("model", spec.get("model")),
            ("disable-model-invocation", disable_model_invocation),
            ("user-invocable", spec.get("user_invocable")),
            ("mcp-servers", spec.get("mcp_servers")),
            ("metadata", spec.get("metadata")),
        ]
    )
    return template("copilot-agent.md").replace("{{frontmatter}}", fm).replace(
        "{{instructions}}", spec["instructions"]
    )


def render_agy(spec: dict[str, Any]) -> str:
    fm = yaml_frontmatter(
        [
            ("name", spec["name"]),
            ("description", spec["description"]),
        ]
    )
    title = spec.get("display_name") or spec["name"].replace("-", " ").title()
    return (
        template("antigravity-skill.md")
        .replace("{{frontmatter}}", fm)
        .replace("{{title}}", title)
        .replace("{{instructions}}", spec["instructions"])
        .replace("{{output_contract}}", output_contract(spec))
        .replace("{{validation}}", validation(spec))
    )


def render(client: str, spec: dict[str, Any]) -> tuple[str, list[str]]:
    warnings: list[str] = []
    if client == "claude":
        return render_claude(spec), warnings
    if client == "codex":
        return render_codex(spec), warnings
    if client == "copilot":
        return render_copilot(spec), warnings
    if client == "agy":
        warnings.append(
            "Antigravity output is a skill/delegation blueprint; no verified native custom sub-agent manifest is rendered."
        )
        return render_agy(spec), warnings
    raise SpecError(f"unsupported client: {client}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Render Claude, Codex, Copilot CLI, and Antigravity sub-agent files from JSON."
    )
    parser.add_argument("--spec", required=True, help="Path to JSON spec.")
    parser.add_argument(
        "--output-root",
        default=".",
        help="Project root for project-scoped outputs. Default: current directory.",
    )
    parser.add_argument(
        "--write",
        action="store_true",
        help="Write files. Omit for dry-run JSON output only.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing files when used with --write.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        spec = validate_spec(read_json(Path(args.spec)))
        output_root = Path(args.output_root).resolve()
        generated = []
        all_warnings: list[str] = []

        for client in spec["clients"]:
            content, warnings = render(client, spec)
            path = target_path(client, spec, output_root)
            all_warnings.extend(warnings)
            item = {
                "client": client,
                "target_path": str(path),
                "content": content,
                "warnings": warnings,
            }
            generated.append(item)

        if args.write:
            for item in generated:
                path = Path(item["target_path"])
                if path.exists() and not args.force:
                    raise SpecError(f"target already exists; use --force to overwrite: {path}")
            for item in generated:
                path = Path(item["target_path"])
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(item["content"], encoding="utf-8", newline="\n")
                log(f"wrote {path}")

        result = {
            "status": "written" if args.write else "dry-run",
            "generated": generated,
            "warnings": all_warnings,
        }
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except SpecError as exc:
        print(
            json.dumps({"status": "error", "error_message": str(exc)}, ensure_ascii=False, indent=2)
        )
        log(f"error: {exc}")
        return 3
    except OSError as exc:
        print(
            json.dumps({"status": "error", "error_message": str(exc)}, ensure_ascii=False, indent=2)
        )
        log(f"write error: {exc}")
        return 5


if __name__ == "__main__":
    raise SystemExit(main())
