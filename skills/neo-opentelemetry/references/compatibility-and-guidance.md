# Compatibility, Migration, and Platform Guidance

Use this reference for Prometheus interoperability, OpenCensus/OpenTracing migration planning, and organization-level telemetry-platform decisions. Programming-language migration code remains outside this skill.

## Prometheus interoperability

Prometheus is built around discovering and scraping targets. OpenTelemetry also supports transporting metrics through OTLP. Newer Prometheus versions can receive OTLP metrics, but the official OpenTelemetry guidance recommends a Collector intermediary for production OpenTelemetry deployments.

Key differences to preserve during migration or translation:

- Prometheus traditionally uses pull-based scraping; OTLP commonly pushes telemetry.
- Metric naming, units, suffixes, and resource-to-label mapping can change during translation.
- Prometheus metrics are cumulative; OpenTelemetry supports more than one aggregation temporality, while Prometheus-facing export requires compatible cumulative behavior.
- OpenTelemetry resource identity maps into Prometheus target identity and related metadata.
- Instrumentation-scope labels can distinguish otherwise identical metric names.
- Duplicate writers or duplicate scrapes can create invalid or out-of-order series.

Operational patterns:

- Use Prometheus receivers when the Collector must scrape existing targets.
- Use the Target Allocator or another sharding mechanism when multiple Collectors scrape Kubernetes targets.
- Use a Collector between OTLP producers and Prometheus for central policy, conversion, buffering, and diagnostics.
- Verify the current Prometheus OTLP receiver requirements before recommending direct ingestion.

## Migration principles

Treat migration as a telemetry-contract change, not only a deployment change.

1. Inventory existing signals, protocols, resource identity, propagation, baggage, dashboards, alerts, SLOs, and retention rules.
2. Define the target OTLP and Collector topology.
3. Establish a compatibility or overlap period when supported.
4. Migrate one bounded telemetry path at a time.
5. Compare old and new volume, identity, attributes, trace continuity, metric continuity, dashboards, and alerts.
6. Update downstream consumers before removing the old feed.
7. Remove compatibility layers only after acceptance criteria pass.

### OpenTracing

OpenTelemetry documents an incremental migration path using compatibility shims, but shim and language details are outside this skill and must be checked in current language documentation.

Operational risks that remain in scope:

- Semantic-convention changes can break dashboards and alerts.
- Baggage behavior differs and can lose propagation when old and new mechanisms are mixed.
- Context-management differences can fragment traces.
- Dual export can duplicate telemetry and increase cost.
- A Collector transformation can provide a temporary compatibility view, but it must have a removal plan.

### OpenCensus

The local documentation entry redirects to the current OpenTelemetry migration guidance rather than containing an operational procedure. Verify the current official migration page and target-language support before planning implementation. Do not invent a generic shim or compatibility guarantee.

## Organization-level platform guidance

### Non-Kubernetes environments

Common challenges include fragmented agent deployment, inconsistent instrumentation, and siloed export paths. A managed approach can:

- Define baseline telemetry and resource-attribution standards.
- Centrally manage agent lifecycle with controlled workload overrides.
- Use a Collector gateway layer for shared policy and backend export.
- Separate global defaults, environment policy, and workload-specific configuration.
- Monitor configuration rollout and agent/Collector health.

### Kubernetes environments

A managed telemetry platform can:

- Distribute consistent defaults through the Operator, Helm, or internal platform automation.
- Give application teams controlled override points without duplicating complete configurations.
- Maintain shared gateway tiers for policy, credentials, and backend routing.
- Process and sample at the layer that has the required data scope.
- Establish joint ownership among platform, observability, security, and workload teams.

Avoid one unbounded shared configuration for every signal and team. Separate pipelines or tiers where load, failure domains, state, or ownership differ.

## Reference implementation lessons

Official reference implementations describe real organizations, not universal blueprints. Extract constraints and trade-offs rather than copying their topology.

Recurring lessons include:

- Start with a simple path and add tiers only when requirements justify them.
- Centralize lifecycle management and safe defaults.
- Keep workload-facing configuration minimal and extensible.
- Separate high-volume or stateful processing from simple collection.
- Plan for component deprecation and controlled upgrades.
- Monitor the telemetry platform itself.

When citing a reference implementation, label the design as that organization's experience rather than an OpenTelemetry requirement.

## Migration acceptance criteria

- Required signals arrive with stable service and resource identity.
- Trace context remains continuous across migrated boundaries.
- Metric names, units, temporality, and labels meet the target contract.
- Dashboards, alerts, and SLOs have equivalent or intentionally changed behavior.
- Expected telemetry volume, cardinality, and cost remain within limits.
- Sensitive-data and access controls remain effective.
- Rollback and overlap behavior are tested.
- Old exporters, shims, routes, and dashboards have an explicit retirement point.

## Official sources

- [OpenTelemetry compatibility](https://opentelemetry.io/docs/compatibility/)
- [Prometheus interoperability](https://opentelemetry.io/docs/compatibility/prometheus/)
- [OTLP metrics export to Prometheus](https://opentelemetry.io/docs/compatibility/prometheus/otlp-metrics-export/)
- [Migrating from OpenCensus](https://opentelemetry.io/docs/compatibility/migration/opencensus/)
- [Migrating from OpenTracing](https://opentelemetry.io/docs/compatibility/migration/opentracing/)
- [Infrastructure and processes in non-Kubernetes environments](https://opentelemetry.io/docs/guidance/blueprints/instrumenting-applications-and-processes-on-nonk8s-environments/)
- [Managed telemetry platforms for Kubernetes workloads](https://opentelemetry.io/docs/guidance/blueprints/managed-telemetry-platforms-for-k8s-workloads/)
- [Reference implementations](https://opentelemetry.io/docs/guidance/reference-implementations/)
