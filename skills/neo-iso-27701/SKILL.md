---
name: neo-iso-27701
description: >
  Use this skill when the user needs to establish, review, or improve an ISO/IEC 27701 PIMS,
  inventory PII processing, analyze controller and processor responsibilities, create a privacy
  risk or evidence matrix, conduct a gap analysis, prepare for an audit, or create an improvement
  plan. Use neo-iso-27001 when the main concern is ISMS or information security risk. Do not treat
  PIMS as a legal-compliance guarantee for any specific privacy law.
license: MIT
compatibility: Requires an Agent Skills client with Markdown and file-reading support; network access for current-version and regulatory checks; and user-provided licensed documents for precise clause-level analysis.
metadata:
  version: "1.0.0"
  pattern: "tool-wrapper,pipeline,reviewer"
  domain: "privacy-information-management"
  source-snapshot: "2026-08-12"
---

# Neo ISO/IEC 27701

Provide evidence-based assistance for establishing, improving, or reviewing a privacy information
management system (PIMS). Read `references/sources-and-scope.md` first, then follow the workflow
below.

## Scope and hard boundaries

In scope:

- PIMS implementation, scope definition, and PII processing-context inventories.
- Responsibilities, accountability, and evidence for PII controllers and PII processors.
- Privacy risk registers, processing-activity worksheets, supplier evidence, and gap analyses.
- Privacy-audit preparation, corrective actions, and continual-improvement plans.

Out of scope:

- Legal advice, legal-basis determinations, or compliance guarantees for any specific jurisdiction.
- Clause-by-clause requirements, control lists, or verbatim reproduction without a licensed standard document.
- Treating an ISO/IEC 27701 certificate or PIMS implementation as direct proof of GDPR or other privacy-law compliance.
- Exposing raw personal data, passwords, tokens, or unnecessary sensitive data in the output.

## Version gate

1. Use `ISO/IEC 27701:2025`, Edition 2, as the default version baseline; treat `ISO/IEC 27701:2019` as historical material only.
2. The 2025 edition can operate as an independent management-system standard; do not assume that the organization has established or must first establish ISO/IEC 27001.
3. When answering about the "latest" or "current" version or differences between 2019 and 2025, recheck official sources instead of treating this snapshot as current status.
4. Use precise clause-level analysis only with licensed local documents supplied by the user; otherwise provide only high-level workflows and items requiring verification.

## Evidence-driven workflow

Execute these steps in order. Do not invent privacy facts when evidence is missing:

1. **Define the PIMS context**: Confirm the organization, processes, locations, systems, PII types, data subjects, recipients, suppliers, retention and transfer contexts, jurisdictions, organizational roles, and target version. Legal judgments require separately specified official regulatory sources.
2. **Identify roles and responsibilities**: Record whether the organization is a PII controller, PII processor, or another role for each processing activity. Do not infer a role only from a contract title.
3. **Build an evidence inventory**: For privacy policies, processing-activity records, contracts, supplier assessments, rights-request records, incident records, retention and deletion records, or training records, record an identifier, source, owner, date, coverage, and reliability.
4. **Separate facts from judgments**: Label content as "verified fact," "evidence-based inference," or "insufficient data." Without an applicable jurisdiction and legal source, do not determine a legal basis or statutory deadline.
5. **Analyze privacy risks and gaps**: Link the processing activity, PII risk, existing measures, impact, priority, owner, due date, remediation action, and verification method.
6. **Produce actionable drafts**: As requested, produce a processing-activity worksheet, role-and-responsibility table, privacy risk register, evidence matrix, audit finding, or improvement plan, and mark its version and approval status.
7. **Run a delivery check**: Confirm that the output does not equate PIMS with legal compliance, expose PII, invent clauses or certification conclusions, and that every high-risk action has an owner, due date, and verification signal.

## Work-product format

Unless the user requests a single fact, use this structure for assessments and reviews:

```markdown
## Conclusion
## PIMS scope, roles, and version
## Verified evidence
## Privacy risks and gaps
## Improvement and corrective-action plan
## Missing information, jurisdiction questions, and limitations
## Sources and verification date
```

Each finding must include at least an identifier, processing activity or evidence, problem, impact, priority, recommended action, owner, due date, and verification method. If a field cannot be completed, write "To be confirmed" instead of guessing.

## Worksheet fields

- **Processing-activity table**: Activity, purpose, PII type, data subject, source, recipient, role, system, supplier, retention and transfer information, evidence identifier, and review date.
- **Role-and-responsibility table**: Processing activity, organizational role, accountable owner, contract or process evidence, exception, review date, and items to be confirmed.
- **Privacy risk register**: Risk identifier, processing activity, scenario, impact, existing measures, risk method, treatment option, owner, due date, residual risk, and evidence.
- **Evidence matrix**: Criteria source, evidence identifier, evidence owner, coverage period, evidence status, gap, remediation action, and verification method.

## Integration with neo-iso-27001

- Use `neo-iso-27001` when the main issue is information security management, information-asset risk, or ISMS.
- When ISMS and PIMS are both in scope, establish the two scope, risk, and evidence chains separately, then document shared processes and cross-dependencies.
- Do not assume that the same policy, risk assessment, or evidence automatically satisfies the other standard merely because both are management systems.

## Regulatory routing

- When the user asks about GDPR, a personal-data law, or another regulation, first confirm the jurisdiction, applicable role, processing activity, and regulatory version; then request or find the regulator, legal text, or other authoritative legal source.
- ISO/IEC 27701 can serve as a working privacy-management framework, but it cannot by itself prove full compliance with a specific law.
- If the regulatory source, organizational role, or processing purpose is missing, report insufficient data and items to be confirmed instead of inferring a legal conclusion.

## Common pitfalls

- Do not apply the historical extension relationship of the 2019 edition directly to the 2025 edition, and do not describe the 2025 edition as necessarily dependent on 27001.
- Having a privacy policy does not equal having effective evidence; check execution records, accountable owners, coverage periods, and exception handling.
- Determine controller and processor roles from concrete processing activities and responsibility evidence, not only from the organization's label or a contract title.
- Every conclusion about the latest version or a regulation must include a verification date and source; if network access is unavailable, state that current status cannot be confirmed.
