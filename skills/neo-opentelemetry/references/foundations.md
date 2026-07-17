# OpenTelemetry Foundations

Use this reference for definitions, system boundaries, correlation, resources, semantic conventions, and terminology. Do not use it for language-specific instrumentation.

## What OpenTelemetry is

OpenTelemetry is an open-source, vendor- and tool-agnostic framework and toolkit for generating, collecting, processing, and exporting telemetry such as traces, metrics, and logs. It is not an observability backend: storage, querying, and visualization are provided by other systems.

This distinction prevents two common category errors:

- Choosing OpenTelemetry does not choose the telemetry storage or user interface.
- Changing a backend does not necessarily require changing how telemetry is represented or transported when both sides support OpenTelemetry standards.

OpenTelemetry's operational building blocks include the OpenTelemetry Protocol (OTLP), semantic conventions, automatic instrumentation, the Collector, the Kubernetes Operator, Helm charts, and FaaS assets. Programming-language APIs, SDKs, and manual instrumentation are intentionally outside this skill.

## Observability and reliability

Observability is the ability to reason about a system's internal state from its outputs, including novel failure modes that were not predicted in advance. Telemetry is the emitted data used for that reasoning.

Reliability asks whether a service delivers the behavior its users expect. Availability alone is not sufficient. A Service Level Indicator (SLI) measures behavior, ideally from the user's perspective; a Service Level Objective (SLO) connects one or more SLIs to an organizational reliability target.

Use signals together:

- Metrics reveal aggregate behavior and trends.
- Traces explain the path and timing of individual requests.
- Logs record discrete events and become more useful when correlated with traces.
- Profiles identify where resources are consumed and can be correlated with other signals.

## Context and propagation

Context contains information used to correlate work across service or execution boundaries. Propagation moves that context between processes or services by serializing it into a carrier and recovering it downstream. The default OpenTelemetry propagator uses W3C Trace Context headers.

Operational consequences:

- Broken propagation produces disconnected traces even when every service emits spans.
- Trace and span identifiers can correlate logs with the request that produced them.
- Incoming context from untrusted sources can be forged; outgoing context can disclose internal information.
- Baggage travels across boundaries and must not contain credentials, tokens, personal data, or other sensitive values.

Manual propagation implementation is outside this skill. Diagnose propagation by verifying carrier presence, trust-boundary policy, and continuity of trace and parent identifiers.

## Resources

A resource describes the entity producing telemetry. Typical dimensions include service identity, host, operating system, process, container, Kubernetes workload, and cloud platform.

Resource guidance:

- Make service identity explicit and stable enough to distinguish logical services.
- Use semantic-convention attribute names where defined.
- Use resource detection for environmental facts, then verify the detected values.
- Avoid attributes whose values change per request; those belong on individual telemetry records, not the producing resource.
- Ensure identities remain globally distinguishable when multiple Collectors or environments report to the same backend.

## Instrumentation scope

Instrumentation scope identifies the logical source that emitted telemetry. Its identity includes a required name and optional version, schema URL, and attributes. Backends can use the scope to filter, group, or compare telemetry from different components or versions.

Keep resource and scope separate:

- Resource answers “what entity produced this telemetry?”
- Instrumentation scope answers “what logical instrumentation source produced this record?”

## Semantic conventions

Semantic conventions standardize names and meanings for common operations and resources. They make telemetry portable and comparable across sources and backends.

When reviewing telemetry:

1. Check whether an applicable convention exists.
2. Check the current convention version and stability before asserting a field is required or stable.
3. Preserve the semantic meaning during transformation; renaming without a mapping can break dashboards, alerts, and queries.
4. Treat custom attributes as additions, not replacements for applicable standard attributes.

## Terminology checkpoints

| Term | Operational meaning |
| --- | --- |
| Telemetry | Data emitted by a system about its behavior. |
| Signal | A category of telemetry, such as traces, metrics, logs, baggage, or profiles. |
| OTLP | The standard OpenTelemetry protocol for telemetry transport. |
| Resource | Metadata describing the entity that produced telemetry. |
| Attribute | Key-value metadata attached to telemetry. |
| Context | Correlation state associated with an execution. |
| Propagation | Movement of context across boundaries. |
| Baggage | User-defined contextual key-value data propagated alongside context. |
| Instrumentation scope | Identity of the logical source that emitted telemetry. |
| Collector | A vendor-agnostic service that receives, processes, and exports telemetry. |

## Official sources

- [What is OpenTelemetry?](https://opentelemetry.io/docs/what-is-opentelemetry/)
- [Observability primer](https://opentelemetry.io/docs/concepts/observability-primer/)
- [Components](https://opentelemetry.io/docs/concepts/components/)
- [Context propagation](https://opentelemetry.io/docs/concepts/context-propagation/)
- [Resources](https://opentelemetry.io/docs/concepts/resources/)
- [Instrumentation scope](https://opentelemetry.io/docs/concepts/instrumentation-scope/)
- [Semantic conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/)
- [Glossary](https://opentelemetry.io/docs/concepts/glossary/)
