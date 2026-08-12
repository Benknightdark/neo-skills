---
name: neo-iso-27001
description: >
  Use this skill when the user needs to establish, review, or improve an ISO/IEC 27001 ISMS,
  perform information security risk discovery, define scope, create an evidence matrix,
  conduct a gap analysis, draft a Statement of Applicability, prepare for an internal audit,
  or create an improvement plan. Use neo-iso-27701 when the main concern is PII, privacy
  management, or PIMS. Do not use this skill for legal advice or certification guarantees.
license: MIT
compatibility: Requires an Agent Skills client with Markdown and file-reading support; network access for current-version checks; and user-provided licensed documents for precise clause-level analysis.
metadata:
  version: "1.0.0"
  pattern: "tool-wrapper,pipeline,reviewer"
  domain: "information-security-management"
  source-snapshot: "2026-08-12"
---

# Neo ISO/IEC 27001

Provide evidence-based assistance for establishing, improving, or reviewing an information
security management system (ISMS). Read `references/sources-and-scope.md` first, then follow
the workflow below.

## Scope and hard boundaries

In scope:

- ISMS implementation roadmaps, scope definition, and interested-party inventories.
- Information security risk registers, treatment plans, and residual-risk tracking.
- Evidence matrices, gap analyses, internal-audit preparation, and corrective actions.
- Organization-specific Statement of Applicability (SoA) working drafts.

Out of scope:

- Guarantees about legal, regulatory, privacy-policy, or certification outcomes.
- Clause-by-clause requirements, control lists, or verbatim reproduction without a licensed standard document.
- Direct deployment of technical controls unless the user separately provides the technical requirements and authorized scope.

## Version gate

1. Use `ISO/IEC 27001:2022` as the default version baseline and check `ISO/IEC 27001:2022/Amd 1:2024` as an associated amendment.
2. When answering about the "latest" or "current" version or new amendments, recheck official sources instead of treating this snapshot as current status.
3. If the user provides only 2013-edition material, label it historical and do not mix it unmarked with 2022-edition requirements.
4. Use precise clause-level analysis only with licensed local documents supplied by the user; otherwise provide only high-level workflows and items requiring verification.

## Evidence-driven workflow

Execute these steps in order. Do not invent organizational facts when evidence is missing:

1. **Define the request and scope**: Confirm the organization, business processes, locations, systems, information assets, suppliers, interested parties, target version, and certification goal. Ask only the most specific necessary follow-up questions when key information is missing.
2. **Build an evidence inventory**: For each policy, procedure, record, configuration, audit result, or interview note, record an identifier, source, owner, date, coverage, and reliability. Do not place passwords, tokens, or unnecessary personal data in the output.
3. **Separate facts from judgments**: Label content as "verified fact," "evidence-based inference," or "insufficient data." Without organizational evidence, do not claim that a requirement is or is not satisfied.
4. **Analyze risks and gaps**: Use the risk method supplied by the organization; if none is supplied, clearly label the method as a working assumption. Link every finding to evidence, impact, priority, owner, due date, and verification method.
5. **Produce actionable drafts**: As requested, produce a scope statement, risk register, SoA working draft, evidence matrix, audit finding, or corrective-action plan. Mark every working draft with its version and approval status.
6. **Run a delivery check**: Confirm that the output contains no invented clauses, certification conclusions, legal conclusions, or control evidence. Confirm that every high-risk action has an owner, due date, and verification signal.

## Work-product format

Unless the user requests a single fact, use this structure for assessments and reviews:

```markdown
## Conclusion
## Applicable scope and version
## Verified evidence
## Risks and gaps
## Improvement and corrective-action plan
## Missing information and limitations
## Sources and verification date
```

Each finding must include at least an identifier, evidence, problem, impact, priority, recommended action, owner, due date, and verification method. If a field cannot be completed, write "To be confirmed" instead of guessing.

## Worksheet fields

- **Scope table**: Organization, processes, locations, systems, information assets, exclusions, exclusion rationale, approver, and version.
- **Risk register**: Risk identifier, scenario, asset or process, existing measures, risk method, treatment option, owner, due date, residual risk, and evidence.
- **SoA working draft**: Requirement or control identifier, applicability status, organizational rationale, implementation evidence, owner, review date, referenced version, and approval status. Do not invent identifiers without a licensed standard.
- **Evidence matrix**: Criteria source, evidence identifier, evidence owner, coverage period, evidence status, gap, remediation action, and verification method.

## Routing to neo-iso-27701

- Use `neo-iso-27701` when the main issue is PII processing, privacy responsibility, PIMS, or privacy evidence.
- When information security and privacy are both in scope, complete the analyses separately and integrate them with explicit cross-references. Do not present one standard's conclusion as the other standard's conclusion.
- The independent management-system status of 27701 does not mean that the organization has necessarily established 27001; verify the actual scope and evidence first.

## Common pitfalls

- Do not mix 2022-edition and 2013-edition documents, risk methods, or control mappings without labeling them.
- An SoA is an organizational scope and risk-decision work product; do not infer it solely from a technology stack or industry name.
- Implementing an ISMS, preparing for an audit, and obtaining third-party certification are different states; describe them separately.
- Having a policy does not equal having effective evidence; check execution records, owners, coverage periods, and sampling results.
- Every conclusion about the latest version must include a verification date and source; if network access is unavailable, state that current status cannot be confirmed.
