# /// script
# dependencies = []
# ///

"""
generate-agents-md.py - Automated non-interactive AGENTS.md generator for neo-harness.

Analyzes a target repository, detects build/test/lint toolchains, and generates
a strict AGENTS.md file that enforces AI agent harness laws and sensor gates.
Enforces a hard limit of 32 KiB (32,768 bytes) on the generated AGENTS.md.
"""

import argparse
import json
import os
import sys
from pathlib import Path

MAX_BYTES = 32768  # 32 KiB limit


def log_diag(msg: str) -> None:
    """Print diagnostic messages to stderr."""
    print(f"[generate-agents-md] {msg}", file=sys.stderr)


def detect_project_facts(target_dir: Path) -> dict:
    """Scan the target repository and extract toolchains and project facts."""
    facts = {
        "project_name": target_dir.name,
        "tech_stack": "General",
        "test_command": "echo 'No test command configured'",
        "lint_command": "echo 'No lint command configured'",
        "typecheck_command": "echo 'No typecheck command configured'",
        "build_command": "echo 'No build command configured'",
    }

    # 1. Node.js / TypeScript
    pkg_json_path = target_dir / "package.json"
    if pkg_json_path.exists():
        try:
            with open(pkg_json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            facts["project_name"] = data.get("name", target_dir.name)
            scripts = data.get("scripts", {})
            facts["tech_stack"] = "Node.js / JavaScript"
            if (target_dir / "tsconfig.json").exists():
                facts["tech_stack"] = "Node.js / TypeScript"
                facts["typecheck_command"] = "npx tsc --noEmit"

            if "test" in scripts:
                facts["test_command"] = "npm test"
            if "lint" in scripts:
                facts["lint_command"] = "npm run lint"
            if "build" in scripts:
                facts["build_command"] = "npm run build"
            if "typecheck" in scripts:
                facts["typecheck_command"] = "npm run typecheck"
        except Exception as e:
            log_diag(f"Warning: Failed to parse package.json: {e}")

    # 2. Python
    pyproject_path = target_dir / "pyproject.toml"
    setup_py_path = target_dir / "setup.py"
    if pyproject_path.exists() or setup_py_path.exists() or list(target_dir.glob("*.py")):
        facts["tech_stack"] = "Python"
        test_cmds = []
        if (target_dir / "tests").exists() or (target_dir / "test").exists():
            test_cmds.append("pytest")
        facts["test_command"] = " && ".join(test_cmds) if test_cmds else "pytest"
        facts["lint_command"] = "ruff check ."
        facts["typecheck_command"] = "mypy ."
        facts["build_command"] = "python3 -m build"

    # 3. Rust
    cargo_path = target_dir / "Cargo.toml"
    if cargo_path.exists():
        facts["tech_stack"] = "Rust"
        facts["test_command"] = "cargo test"
        facts["lint_command"] = "cargo clippy -- -D warnings"
        facts["typecheck_command"] = "cargo check"
        facts["build_command"] = "cargo build"

    # 4. Go
    go_mod_path = target_dir / "go.mod"
    if go_mod_path.exists():
        facts["tech_stack"] = "Go"
        facts["test_command"] = "go test ./..."
        facts["lint_command"] = "golangci-lint run"
        facts["typecheck_command"] = "go vet ./..."
        facts["build_command"] = "go build ./..."

    # 5. .NET / C#
    if list(target_dir.glob("*.csproj")) or list(target_dir.glob("*.sln")):
        facts["tech_stack"] = ".NET / C#"
        facts["test_command"] = "dotnet test"
        facts["lint_command"] = "dotnet format --verify-no-changes"
        facts["typecheck_command"] = "dotnet build --no-incremental"
        facts["build_command"] = "dotnet build"

    # 6. Neo Skills Syntax Check
    syntax_script = target_dir / "scripts" / "check-skills-syntax.py"
    if syntax_script.exists():
        facts["syntax_command"] = "python3 scripts/check-skills-syntax.py"

    return facts


def generate_agents_md_content(facts: dict) -> str:
    """Generate the AGENTS.md Markdown content based on project facts."""
    rows = []
    if facts.get("test_command") and not facts["test_command"].startswith("echo 'No"):
        rows.append(f"| **Unit / Integration Tests** | `{facts['test_command']}` | Verify behavioral correctness |")
    if facts.get("syntax_command") and not facts["syntax_command"].startswith("echo 'No"):
        rows.append(f"| **Skill Syntax Check** | `{facts['syntax_command']}` | Verify skill markdown and frontmatter syntax |")
    if facts.get("typecheck_command") and not facts["typecheck_command"].startswith("echo 'No"):
        rows.append(f"| **Type Check** | `{facts['typecheck_command']}` | Verify static type contracts |")
    if facts.get("lint_command") and not facts["lint_command"].startswith("echo 'No"):
        rows.append(f"| **Lint & Format** | `{facts['lint_command']}` | Enforce code style and syntax rules |")
    if facts.get("build_command") and not facts["build_command"].startswith("echo 'No"):
        rows.append(f"| **Build Check** | `{facts['build_command']}` | Confirm clean compilation |")

    table_header = "| Command Type | Exact Command Line | Purpose / Scope |\n| :--- | :--- | :--- |"
    table_body = "\n".join(rows) if rows else "| **None** | `echo 'No commands configured'` | N/A |"
    commands_table = f"{table_header}\n{table_body}"

    content = f"""# {facts['project_name']} AGENTS.md

---

## 1. Project Overview

- **Primary Technology Stack**: `{facts['tech_stack']}`
- **Coding & Architectural Conventions**:
  - Follow modular architecture and existing code formatting.
  - Inspect existing implementation files before creating new utilities.
  - Do NOT introduce unrequested third-party dependencies.

---

## 2. Commands

List exact command lines used for project development, testing, linting, typechecking, and building:

{commands_table}

---

## 3. Workflow

The development workflow strictly follows this 9-stage closed loop:

```mermaid
graph TD
    Step1[1. Perceive Task] --> Step2[2. Establish Baseline]
    Step2 --> Step3[3. Reproduce Problem]
    Step3 --> Step4[4. Plan Edits]
    Step4 --> Step5[5. Minimal Implementation]
    Step5 --> Step6[6. Incremental Verification]
    Step6 --> Step7[7. Self-Review]
    Step7 -->|Fail| Step4
    Step7 -->|Pass| Step9[9. Handoff upon Pass]
```

1. **Perceive Task**: Read project guidelines (`AGENTS.md`) and target source files to understand goals and constraints.
2. **Establish Baseline**: Run existing test and build commands to confirm the project is in a stable, passing state.
3. **Reproduce Problem**: Write or run test cases/verification steps that reliably reproduce the issue or requirement.
4. **Plan Edits**: Decompose the task into small, atomic edit plans to avoid large single-turn changes.
5. **Minimal Implementation**: Apply minimal code changes while preserving existing comments and public API contracts.
6. **Incremental Verification**: Run local test, lint, and build commands immediately after each edit.
7. **Self-Review**: Inspect diffs and execution logs; if checks fail, read full un-truncated error logs to find the root cause.
8. **Remediate on Failure**: If verification or self-review fails, return to "Plan Edits / Minimal Implementation" to adjust.
9. **Handoff upon Pass**: Once all verification sensors pass, present a concise report with empirical proof for handoff.

---

## 4. Forbidden Antipattern Redlines

| Forbidden Action | Why It Is Prohibited | Required Behavior |
| :--- | :--- | :--- |
| **Silent Exception Swallowing** | Hides runtime failures and causes silent data corruption. | Let exceptions surface or handle explicitly with logging. |
| **Test Deletion / Suppression** | Forces builds to pass without fixing underlying bugs. | Fix root cause in source or update contract with justification. |
| **Hallucinated Signatures** | Invokes non-existent methods causing runtime crashes. | View symbol definition using search tools first. |
| **Unverified Completion Claim** | Misleads user regarding feature or bug state. | Run test/build commands and present log proof. |
"""
    return content


def enforce_size_limit(content: str) -> str:
    """Ensure the content size does not exceed 32 KiB (32,768 bytes)."""
    encoded = content.encode("utf-8")
    if len(encoded) <= MAX_BYTES:
        return content

    log_diag(f"Warning: Content size ({len(encoded)} bytes) exceeds 32 KiB limit. Pruning...")
    # Truncate lines from bottom if necessary, preserving structure
    lines = content.splitlines()
    while lines and len("\n".join(lines).encode("utf-8")) > MAX_BYTES:
        lines.pop()
    
    pruned_content = "\n".join(lines) + "\n\n<!-- Truncated to fit within 32 KiB limit -->\n"
    return pruned_content


def main():
    parser = argparse.ArgumentParser(
        description="Non-interactive AGENTS.md generator for neo-harness."
    )
    parser.add_argument(
        "--target-dir",
        type=str,
        default=".",
        help="Path to target project directory (default: current directory)",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="",
        help="Output path for AGENTS.md (default: <target-dir>/AGENTS.md)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Output content to stdout without writing file",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite output file if it already exists",
    )

    args = parser.parse_args()

    target_dir = Path(args.target_dir).resolve()
    if not target_dir.exists() or not target_dir.is_dir():
        log_diag(f"Error: Target directory '{target_dir}' does not exist or is not a directory.")
        sys.exit(1)

    output_path = Path(args.output) if args.output else target_dir / "AGENTS.md"

    log_diag(f"Scanning target directory: {target_dir}")
    facts = detect_project_facts(target_dir)
    log_diag(f"Detected project name: {facts['project_name']}, tech stack: {facts['tech_stack']}")

    content = generate_agents_md_content(facts)
    content = enforce_size_limit(content)

    byte_size = len(content.encode("utf-8"))
    log_diag(f"Generated AGENTS.md size: {byte_size} bytes ({byte_size/1024:.2f} KiB)")

    if args.dry_run:
        sys.stdout.write(content)
        return

    if output_path.exists() and not args.force:
        log_diag(f"Warning: Output file '{output_path}' exists. Use --force to overwrite.")
        sys.exit(1)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    log_diag(f"Successfully generated '{output_path}' ({byte_size} bytes).")


if __name__ == "__main__":
    main()
