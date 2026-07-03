---
name: neo-agentic-design
description: >
  Use this skill when designing, evaluating, or implementing Agent workflows, prompt chains, routing, planning, reflection, multi-agent collaboration, memory management, or other framework-agnostic LLM orchestration patterns.
license: MIT
compatibility: No specific language runtime required; conceptual-only patterns.
metadata:
  version: "1.0.0"
  type: "conceptual-design"
---

# Neo Agentic Design

This skill provides architectural concepts and orchestration patterns for building LLM Agent systems. It covers 21 core design patterns categorized into four themes. The orchestration logic remains abstract and independent of specific programming languages or frameworks.

## Gotchas
* **Over-engineering**: Prioritize simple prompt chains (Chapter 1) or routing (Chapter 2). Use complex multi-agent collaboration (Chapter 7) or hierarchical networks only when necessary to reduce token overhead.
* **Reflection Infinite Loops**: When implementing reflection (Chapter 4) or self-correction (Chapter 12), enforce a maximum iteration limit (e.g., 3-5 iterations) to prevent the LLM from getting stuck in an infinite loop.
* **Blocking Operations**: High-risk operations (such as direct database deletions or large fund transfers) must include a Human-in-the-Loop review gate (Chapter 13).
* **Context Pruning State Loss**: When compressing context, protect critical agent instructions from being pruned to prevent behavioral degradation.

## Workflow Checklist
Progress:
- [ ] Step 1: Analyze Requirements (define objectives, inputs, constraints, and complexity levels).
- [ ] Step 2: Select Orchestration Patterns (load corresponding reference documents based on requirements).
- [ ] Step 3: Plan System Components (determine memory, learning mechanisms, and protocol specifications).
- [ ] Step 4: Define Resilience and Safety (establish exception handling, human review gates, and input/output guardrails).
- [ ] Step 5: Draft Design Proposal (create system topology diagrams and describe the architecture).

## Detailed Guidelines

### Step 1 — Analyze Requirements
Evaluate problem complexity (Level 1, 2, or 3) and confirm:
1. **Latency Sensitivity**: For low-latency requirements, prioritize parallelization (Chapter 3) and routing (Chapter 2).
2. **Task Fragility**: For strict sequential tasks or error-prone processes, use chaining (Chapter 1) or planning (Chapter 6).

### Step 2 — Load Design Patterns (Progressive Loading)
Load specific reference files as needed to avoid loading all concepts at once:
* Base workflows (Prompt Chaining, Routing, Parallelization, Reflection, Tool Use, Planning, Multi-Agent Collaboration):
  👉 **Load [base-workflows](references/base-workflows.md)**
* System infrastructure (Memory Management, Learning and Adaptation, MCP, Goal Setting and Monitoring):
  👉 **Load [system-components](references/system-components.md)**
* Exception handling, HITL, RAG fact-grounding:
  👉 **Load [resilience-hitl](references/resilience-hitl.md)**
* Advanced safety, evaluation, prioritization, A2A communication, exploration and discovery:
  👉 **Load [advanced-safety](references/advanced-safety.md)**

### Step 3 — System Architecture Planning
The design document must clearly document:
1. **State Space**: Context window management method and division of short-term and long-term memory (cognitive/procedural memory).
2. **Tool Boundaries**: Tool call schema protocols and sandbox rules.
3. **Safety Boundaries**: Specific conditions for triggering human approval (HITL) or falling back to backup models.

---

## Output Template (Agentic Architecture Design Proposal)

When presenting agent designs to users, use this template format:

```markdown
# Agentic System Design Proposal: [System Name]

## 1. Executive Summary
* **Complexity Level**: [Level 1 / Level 2 / Level 3]
* **Target Objective**: [System Goal]
* **Key Constraints**: [Constraints such as latency, cost, security, etc.]

## 2. Core Orchestration Architecture
* **Selected Patterns**: [e.g., Router -> Parallel Agents -> Synthesizer]
* **Workflow Description**: [System data flow and control flow description]

### Topology Diagram (Mermaid)
```mermaid
[Mermaid diagram representing the Agent Loop / Topology]
```

## 3. Reference Patterns Applied
* **[Pattern Name] (Chapter X)**: [Specific application and rationale in the system]
* **[Pattern Name] (Chapter Y)**: [Specific application and rationale in the system]

## 4. Resilience, Safety & HITL Rules
* **Exception Recovery**: [Handling flow for API timeouts, rate limits, and JSON formatting errors]
* **Human-in-the-Loop Gates**: [Conditions triggering human review]
* **Guardrails**: [Input filtering and output validation mechanisms]

## 5. Next Steps / Implementation Roadmap
1. [Step 1]
2. [Step 2]
```
