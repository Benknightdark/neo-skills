# Signals and Sampling

Use this reference to select signals, reason about correlation, and evaluate sampling. Signal maturity and feature support can change; verify current status before making version-dependent claims.

## Signal selection

| Signal | Primary question | Operational strengths | Important limitations |
| --- | --- | --- | --- |
| Traces | How did one request travel through the system? | Causality, dependency paths, per-request latency, error localization | Volume can be high; incomplete propagation fragments traces |
| Metrics | What is happening in aggregate over time? | Alerting, trends, capacity, SLI/SLO measurement | Aggregation loses individual-event detail; dimensions can create high cardinality |
| Logs | What discrete event occurred? | Detailed event records and existing operational workflows | Unstructured records are costly to normalize; correlation requires context |
| Baggage | What request-scoped context must be available downstream? | Carries selected context across service boundaries | Propagates broadly, is not automatically a signal attribute, and has security risks |
| Profiles | Where are CPU, memory, or other resources being consumed? | Resource bottlenecks and correlation with slow requests or resource spikes | Availability, status, and supported profile types depend on current tooling |

Do not replace one signal with another merely because they share attributes. Prefer correlation through stable resource identity and trace context.

## Traces

A trace represents the path of a request and contains one or more spans. A span represents one unit of work and can carry timing, status, attributes, events, and links. Parent-child relationships describe causal or nested work.

Review trace quality by checking:

- Root and child span boundaries reflect meaningful operations.
- Trace and parent identifiers remain continuous across boundaries.
- Attributes follow semantic conventions and avoid sensitive or unbounded values.
- Error state and latency are represented consistently enough for sampling and analysis.
- Resource identity distinguishes services and instances.

## Metrics

A metric represents measurements aggregated over time. Operationally, distinguish:

- Additive changes from current-state values.
- Monotonic values from values that may rise or fall.
- Cumulative from delta temporality.
- Metric identity from attribute dimensions.

Cardinality is the number of distinct time series produced by the combination of metric identity and attributes. User IDs, request IDs, raw URLs, and other unbounded values can make a metric operationally expensive or unusable. Prefer bounded dimensions that support an explicit operational question.

When multiple Collector instances handle the same metric stream, preserve a globally unique writer identity and avoid duplicate writers that can create gaps, jumps, or out-of-order samples.

## Logs

OpenTelemetry can receive, normalize, correlate, process, and export existing logs. Structured logs have a stable schema or typed fields; JSON encoding alone does not guarantee structure. Semistructured and unstructured logs usually need parsing and normalization before reliable analysis.

Operational priorities:

1. Preserve event time and observed time when both are available.
2. Add resource identity at collection time when the source does not provide it.
3. Correlate logs with trace and span identifiers where supported.
4. Normalize schemas before downstream rules depend on them.
5. Filter or redact sensitive fields before export.

Language logging bridges and application logging code are outside this skill.

## Baggage

Baggage is propagated contextual data, separate from span, metric, and log attributes. A baggage item is not automatically copied into telemetry attributes.

Use baggage only when downstream components genuinely need request-scoped context. Never place credentials, API keys, session tokens, personal information, or other sensitive data in baggage. Define trust-boundary rules for accepting and forwarding baggage because it can leave the controlled network through automatic propagation.

## Profiles

Profiles contain samples and metadata describing resource consumption over time. They can complement:

- Metrics by explaining a CPU or memory spike.
- Traces by locating resource consumption associated with a slow request.
- Logs by connecting a failure event to resource pressure.

Keep profile collection details out of recommendations unless current official support has been verified for the target environment.

## Sampling

Sampling reduces trace volume by retaining a representative subset. Filtering and aggregation may also reduce data, but they do not automatically preserve representativeness.

### Head sampling

Head sampling decides early without examining the complete trace. It is comparatively simple and efficient, but cannot reliably retain every trace that later becomes slow or erroneous.

Use head sampling when an early, consistent probability decision satisfies the observability goal and the lost late-trace information is acceptable.

### Tail sampling

Tail sampling decides after receiving all or most spans in a trace. It can retain traces based on whole-trace criteria such as errors, latency, attributes, or service-specific policy.

Tail sampling is stateful and operationally expensive. It requires:

- Enough memory and decision time to retain spans awaiting a decision.
- Routing that sends every span for a trace to the same sampling instance.
- Monitoring for dropped spans, late spans, decision-cache pressure, and uneven routing.
- Reassessment as traffic and service behavior change.

For multiple gateways, trace-ID-aware routing is necessary but does not remove every scaling caveat. Prefer a single adequately sized tail-sampling gateway until the need for a distributed design and its consistency strategy are demonstrated.

### Sampling decision checklist

1. Identify the cost or capacity problem sampling must solve.
2. State what information may be lost and whether regulation permits dropping it.
3. Measure trace volume and traffic variation by service.
4. Define required retention rules for errors, latency, or business-critical traffic.
5. Choose head sampling unless whole-trace evidence is required.
6. If using tail sampling, design trace-affine routing and capacity before enabling it.
7. Validate the retained population and monitor sampling infrastructure.

## Official sources

- [Signals](https://opentelemetry.io/docs/concepts/signals/)
- [Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
- [Metrics](https://opentelemetry.io/docs/concepts/signals/metrics/)
- [Logs](https://opentelemetry.io/docs/concepts/signals/logs/)
- [Baggage](https://opentelemetry.io/docs/concepts/signals/baggage/)
- [Profiles](https://opentelemetry.io/docs/concepts/signals/profiles/)
- [Sampling](https://opentelemetry.io/docs/concepts/sampling/)
