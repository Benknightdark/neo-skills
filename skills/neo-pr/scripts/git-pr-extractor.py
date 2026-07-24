# /// script
# dependencies = []
# ///

"""
git-pr-extractor.py

Non-interactive Git diff and commit extraction script.
Given target_branch and source_branch, fetches Git logs, changed files, and diff summary,
then outputs JSON formatted data to stdout.
"""

import argparse
import json
import os
import subprocess
import sys

def run_command(cmd, cwd=None):
    result = subprocess.run(
        cmd,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    return result.returncode, result.stdout, result.stderr

def main():
    parser = argparse.ArgumentParser(description="Extract git diff and commit information for PR generation.")
    parser.add_argument("--target-branch", default="main", help="Target base branch (e.g. main, develop)")
    parser.add_argument("--source-branch", default="HEAD", help="Source feature branch (e.g. feature/auth, HEAD)")
    parser.add_argument("--repo-path", default=".", help="Path to git repository")
    parser.add_argument("--max-diff-lines", type=int, default=500, help="Maximum lines of diff to include")

    args = parser.parse_args()
    repo_path = os.path.abspath(args.repo_path)

    # Verify if directory is inside a valid Git workspace
    code, out, err = run_command(["git", "rev-parse", "--is-inside-work-tree"], cwd=repo_path)
    if code != 0:
        sys.stderr.write(f"Error: Path {repo_path} is not a valid git repository.\n{err}")
        sys.exit(1)

    # Retrieve current branch name for fallback reference
    _, current_branch, _ = run_command(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=repo_path)
    current_branch = current_branch.strip()

    source = args.source_branch
    if source == "HEAD":
        source_name = current_branch
    else:
        source_name = source

    target = args.target_branch
    rev_range = f"{target}..{source}"

    # 1. Fetch Commit History
    code, log_out, log_err = run_command(["git", "log", rev_range, "--oneline"], cwd=repo_path)
    if code != 0:
        sys.stderr.write(f"Error executing git log for range {rev_range}:\n{log_err}")
        sys.exit(1)

    commits = [line.strip() for line in log_out.strip().split("\n") if line.strip()]

    # 2. Fetch git diff --stat Summary
    _, stat_out, _ = run_command(["git", "diff", rev_range, "--stat"], cwd=repo_path)

    # 3. Fetch List of Modified Files
    _, name_status_out, _ = run_command(["git", "diff", rev_range, "--name-status"], cwd=repo_path)
    changed_files = []
    for line in name_status_out.strip().split("\n"):
        if line.strip():
            parts = line.strip().split(maxsplit=1)
            if len(parts) == 2:
                changed_files.append({"status": parts[0], "file": parts[1]})

    # 4. Fetch Truncated Git Diff Output (Prevents Token Overhead)
    _, diff_out, _ = run_command(["git", "diff", rev_range], cwd=repo_path)
    diff_lines = diff_out.split("\n")
    is_truncated = len(diff_lines) > args.max_diff_lines
    short_diff = "\n".join(diff_lines[:args.max_diff_lines])

    output_data = {
        "repository_path": repo_path,
        "target_branch": target,
        "source_branch": source_name,
        "commit_count": len(commits),
        "commits": commits,
        "stat_summary": stat_out.strip(),
        "changed_files": changed_files,
        "diff_snippet": short_diff,
        "diff_truncated": is_truncated
    }

    # Output JSON string exclusively to stdout
    print(json.dumps(output_data, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
