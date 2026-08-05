#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""Non-interactive Git change and file reader for AI Agents.

Output rules:
1. Never request interactive input.
2. Write diagnostics to stderr.
3. Write JSON results to stdout or the file supplied with --output.
"""

import argparse
import json
import os
import subprocess
import sys
from typing import Any, Dict, List


def log_diagnostic(message: str) -> None:
    """Write a diagnostic message to stderr."""
    print(f"[LOG] {message}", file=sys.stderr)


def run_command(cmd: List[str]) -> str:
    """Run a command and return stdout while preserving stderr on failure."""
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout
    except subprocess.CalledProcessError as error:
        raise RuntimeError(
            f"Command failed: {' '.join(cmd)}\nStderr: {error.stderr}"
        ) from error


def is_git_repository() -> bool:
    """Return whether the current path is inside a Git worktree."""
    try:
        run_command(["git", "rev-parse", "--is-inside-work-tree"])
        return True
    except RuntimeError:
        return False


def has_git_head() -> bool:
    """Return whether the repository has at least one commit."""
    try:
        run_command(["git", "rev-parse", "--verify", "HEAD"])
        return True
    except RuntimeError:
        return False


def get_git_diff(staged_only: bool = False, commit_range: str | None = None) -> str:
    """Get staged changes or a requested commit range."""
    cmd = ["git", "diff"]
    if commit_range:
        cmd.append(commit_range)
    elif staged_only:
        cmd.append("--cached")

    log_diagnostic(f"Running Git command: {' '.join(cmd)}")
    return run_command(cmd)


def get_working_tree_diff() -> str:
    """Get tracked changes after HEAD, including staged and unstaged changes."""
    if has_git_head():
        cmd = ["git", "diff", "HEAD", "--"]
        log_diagnostic(f"Running Git command: {' '.join(cmd)}")
        return run_command(cmd)

    log_diagnostic("The repository has no HEAD; collecting staged and unstaged changes separately.")
    parts = [
        run_command(["git", "diff", "--cached", "--"]),
        run_command(["git", "diff", "--"]),
    ]
    return "\n".join(part for part in parts if part.strip())


def get_untracked_files() -> List[str]:
    """Get non-ignored untracked files while preserving spaces in paths."""
    output = run_command(["git", "ls-files", "--others", "--exclude-standard", "-z"])
    return [path for path in output.split("\0") if path]


def read_files_content(paths: List[str]) -> List[Dict[str, str]]:
    """Read the contents of the supplied files."""
    contents: List[Dict[str, str]] = []
    for path in paths:
        if not os.path.exists(path):
            log_diagnostic(f"[WARN] File does not exist; skipping: {path}")
            continue
        if os.path.isdir(path):
            log_diagnostic(f"[WARN] Path is a directory; skipping: {path}")
            continue

        try:
            log_diagnostic(f"Reading file: {path}")
            with open(path, "r", encoding="utf-8", errors="ignore") as file:
                contents.append({"path": path, "content": file.read()})
        except OSError as error:
            log_diagnostic(f"[ERROR] Could not read {path}: {error}")

    return contents


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Non-interactive Git change and file reader for AI Agents.",
        epilog="Example: uv run git-diff-reviewer.py --working-tree",
    )
    parser.add_argument(
        "-i",
        "--input",
        nargs="*",
        help="File paths to review; use Git change mode when omitted.",
    )
    parser.add_argument(
        "--staged",
        action="store_true",
        help="Read staged Git changes only.",
    )
    parser.add_argument(
        "--working-tree",
        action="store_true",
        help="Read tracked changes after HEAD and non-ignored untracked files.",
    )
    parser.add_argument(
        "--commit",
        help="Commit hash or range, for example HEAD~1..HEAD.",
    )
    parser.add_argument(
        "-o",
        "--output",
        help="Write JSON to this file instead of stdout.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Check the selected mode and Git state without reading change content.",
    )
    args = parser.parse_args()

    selectors = [
        bool(args.input),
        args.staged,
        args.working_tree,
        bool(args.commit),
    ]
    if sum(selectors) > 1:
        raise ValueError(
            "The --input, --staged, --working-tree, and --commit options are mutually exclusive."
        )

    return args


def main() -> None:
    try:
        args = parse_args()
        result: Dict[str, Any] = {
            "mode": "git-diff",
            "diff": "",
            "files": [],
            "status": "success",
        }

        if args.input:
            result["mode"] = "specific-files"
            log_diagnostic(f"Specific-file review mode; file count: {len(args.input)}")
            if not args.dry_run:
                result["files"] = read_files_content(args.input)
        else:
            if not is_git_repository():
                result["status"] = "error"
                result["error_message"] = "The current path is not a Git repository and no input files were supplied."
                print(json.dumps(result, indent=2, ensure_ascii=False))
                log_diagnostic("[ERROR] The current path is not a Git repository.")
                sys.exit(1)

            if args.working_tree:
                result["mode"] = "working-tree"
                log_diagnostic("Entering working-tree review mode.")
                if not args.dry_run:
                    result["diff"] = get_working_tree_diff()
                    untracked_files = get_untracked_files()
                    result["files"] = read_files_content(untracked_files)
                    if not result["diff"].strip() and not untracked_files:
                        result["status"] = "empty"
                        log_diagnostic("No tracked or untracked changes were detected.")
            else:
                log_diagnostic("Entering Git change review mode.")
                if not args.dry_run:
                    diff_content = get_git_diff(
                        staged_only=args.staged,
                        commit_range=args.commit,
                    )
                    if not diff_content.strip():
                        result["status"] = "empty"
                        log_diagnostic("No Git changes were detected.")
                    else:
                        result["diff"] = diff_content

        output_str = json.dumps(result, indent=2, ensure_ascii=False)
        if args.output:
            with open(args.output, "w", encoding="utf-8") as file:
                file.write(output_str)
            log_diagnostic(f"Wrote JSON result to: {args.output}")
        else:
            print(output_str)

        sys.exit(0)
    except Exception as error:
        log_diagnostic(f"[FATAL] Execution failed: {error}")
        print(
            json.dumps(
                {"status": "error", "error_message": str(error)},
                indent=2,
                ensure_ascii=False,
            )
        )
        sys.exit(1)


if __name__ == "__main__":
    main()
