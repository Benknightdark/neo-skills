---
name: neo-opentelemetry
description: >
  Use this skill when explaining OpenTelemetry concepts, choosing telemetry signals,
  planning or reviewing Collector architectures and declarative configuration,
  operating or troubleshooting telemetry pipelines, securing telemetry data,
  evaluating zero-code instrumentation, or planning Prometheus, OpenCensus, or
  OpenTracing interoperability and migration. Do not use it to write language SDK/API
  instrumentation code or custom Collector components.
compatibility: No runtime required. Network access is required to verify current versions, component status, security advisories, and other time-sensitive claims.
metadata:
  version: "1.0.0"
  pattern: "tool-wrapper,pipeline"
  domain: "observability-operations"
  source-revision: "b18eb4d01fab9be2c5c22b1aaafdeb23ba97e3d4"
---

# Neo OpenTelemetry

Provide source-grounded OpenTelemetry guidance for concepts and operations without generating programming-language instrumentation code.

## Scope boundary

In scope:

- Observability concepts, telemetry signals, correlation, resources, semantic conventions, and sampling.
- Collector pipelines, components, deployment patterns, declarative configuration, scaling, resiliency, internal telemetry, transformation, and troubleshooting.
- Kubernetes, FaaS, OpenTelemetry Operator, OBI, and other zero-code operational approaches.
- Security, sensitive-data handling, Prometheus interoperability, and OpenCensus/OpenTracing migration planning.

Out of scope:

- Language-specific SDK/API usage, manual instrumentation, source-code examples, and library integration code.
- Building the Collector from source or developing custom receivers, processors, exporters, connectors, or extensions.
- Vendor pricing, backend-specific query languages, and backend product administration unless needed only as context for an OpenTelemetry decision.

If the request crosses the boundary, answer the in-scope operational portion and identify the excluded portion. Point to the appropriate official language or component-development documentation instead of inventing code.

## Workflow

1. Classify the request as explanation, architecture decision, configuration review, security review, migration, or troubleshooting.
2. Load `references/sources-and-scope.md` whenever the answer depends on source coverage, current status, or an excluded area.
3. Load only the references required by the request:
   - Foundations and terminology: `references/foundations.md`
   - Signals and sampling: `references/signals-and-sampling.md`
   - Collector topology and configuration: `references/collector-architecture-and-configuration.md`
   - Collector operations and troubleshooting: `references/collector-operations.md`
   - Kubernetes, FaaS, Operator, and zero-code: `references/platforms-and-zero-code.md`
   - Security and sensitive data: `references/security.md`
   - Prometheus, migration, and deployment guidance: `references/compatibility-and-guidance.md`
4. Inspect user-provided configuration and environment evidence before recommending changes. Never assume topology, volume, failure tolerance, trust boundaries, or backend capabilities.
5. Verify time-sensitive facts against official OpenTelemetry sources. If verification is unavailable, identify the snapshot revision and state that current status cannot be confirmed.
6. Produce the smallest useful response and cite the official page supporting material claims.

## Decision rules

- Treat OpenTelemetry as a telemetry generation, collection, processing, and export framework, not as a storage or visualization backend.
- Default to the simplest deployment pattern that satisfies the stated requirements. Add gateways, stateful routing, persistent queues, or external message queues only for an identified need.
- Separate symptoms by pipeline stage: generation, reception, processing, queuing, export, network, or backend.
- Treat sampling, filtering, redaction, and transformation as data-loss or data-quality decisions. State what is intentionally discarded or changed.
- Never recommend scaling Collectors before checking whether the bottleneck is the Collector, network, or backend.
- Never place credentials, tokens, personal data, or other sensitive values in examples.
- Prefer least privilege, restricted listener addresses, authenticated and encrypted network paths, data minimization, and Collector self-observability.

## Response contracts

For explanations, provide:

1. Direct answer.
2. Relevant OpenTelemetry concepts and boundaries.
3. Official source links.

For architecture or configuration reviews, provide:

1. Observed requirements or configuration facts.
2. Findings ordered by impact.
3. Recommended topology or declarative changes with trade-offs.
4. Capacity, resiliency, security, and validation checks.
5. Official source links.

For troubleshooting, provide:

1. Observed symptom and missing evidence.
2. Most likely pipeline stage based on supplied evidence; label this as an inference.
3. Non-destructive checks ordered from source to destination.
4. Remediation only after the failing stage is isolated.
5. Verification signals and official source links.

## Fact-check gate

- Distinguish verified source facts from recommendations and inferences.
- Do not convert documentation examples into universal defaults.
- Do not state version numbers, maturity levels, component availability, default ports, default limits, or CVE status without checking the current official source when the answer depends on them.
- Say that data is insufficient when the request lacks evidence needed for a safe operational conclusion.
