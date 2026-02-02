---
name: explain
description: Analyzes source code or project structures to provide technical explanations and architectural insights.
---

# Project Code Explanation Specification

## Perceive
1. Intercept the standard input (stdin) or file arguments passed via the CLI command.
2. Detect the file context by reading the specified file paths or the current working directory.
3. Identify programming languages through file extensions or shebang lines.
4. Capture optional flags such as `--all` or specific line ranges to define the scope of analysis.

## Reason
1. Structural Parsing: Map the relationships between variables, functions, and classes within the provided context.
2. Logic Synthesis: Consolidate fragmented code segments into a coherent operational flow.
3. Contextual Inference: Evaluate how the specific code block interacts with standard libraries or identified project dependencies.
4. Documentation Alignment: Compare the implementation against common design patterns to explain "why" the code is structured in its current form.

## Act
1. Output a structured explanation directly to the terminal's standard output (stdout).
2. Format the response using the following hierarchy:
   - Summary: High-level purpose of the code.
   - Logic Flow: Step-by-step execution breakdown.
   - Key Components: Definitions of primary symbols and their roles.
3. Apply syntax highlighting to any code blocks included within the explanation.
4. Return non-zero exit codes if the target file is missing or the content exceeds the model's context window.