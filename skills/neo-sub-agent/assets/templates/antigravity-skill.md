---
{{frontmatter}}
---

# {{title}}

Use this skill as an Antigravity CLI delegation blueprint. It defines when the main agent should route work to a focused background specialist and what that specialist must return.

## Compatibility Note
This file is an Agent Skill / delegation blueprint for Antigravity CLI. It is not a native custom sub-agent manifest; no stable standalone custom sub-agent manifest format is assumed here.

## Role
{{instructions}}

## Delegation Rules
- Use this role only when the task matches the description.
- Keep the delegated task bounded and self-contained.
- Return a concise result to the parent conversation instead of full logs.
- Ask the parent conversation for approval before destructive actions, broad rewrites, migrations, or production-impacting work.

## Output Contract
{{output_contract}}

## Validation
{{validation}}
