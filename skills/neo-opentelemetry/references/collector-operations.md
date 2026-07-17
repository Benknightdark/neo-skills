# Collector Operations and Troubleshooting

Use this reference for installation planning, self-observability, capacity, resiliency, transformation, and incident diagnosis.

## Installation and distribution checks

Before using any component or command, confirm:

- Target operating system or Kubernetes environment.
- Collector distribution and version.
- Included receivers, processors, exporters, connectors, and extensions.
- Configuration file location and executable name.
- Required network access, filesystem access, capabilities, and credentials.

Do not assume the core and contrib distributions contain the same components. Registry listings and component maturity are time-sensitive and require current verification.

## Internal telemetry

The Collector must expose enough telemetry to distinguish its own saturation from upstream, network, or backend failures. Monitor at least:

- Accepted and refused telemetry by receiver and signal.
- Processor drops and refusals.
- Export successes, permanent failures, and enqueue failures.
- Exporter queue size and capacity.
- CPU, memory, and restart behavior.
- Request latency and errors for downstream destinations.
- Scrape duration relative to scrape interval for pull-based receivers.

Metric names can change across versions. Confirm the current names before creating alerts; use the names documented by the installed version.

## Scaling decision flow

1. Split demand by signal, protocol, and collection behavior.
2. Identify whether components are stateless, scrapers, or stateful.
3. Check refusal, queue, resource, and downstream latency evidence.
4. Determine whether the constraint is Collector CPU/memory, a scrape schedule, the network, or the backend.
5. Scale only the constrained tier and preserve stateful routing rules.

Scaling patterns:

- Stateless receivers and processors can usually scale horizontally behind a suitable load balancer.
- Scrapers require target sharding or allocation to prevent duplicate collection.
- Stateful processors require affinity and careful redistribution behavior.
- Signal-specific Collector tiers can isolate failures and scale independently.

Do not add Collectors when the exporter queue remains full because the backend or network cannot accept more traffic. That can increase pressure without increasing throughput.

## Resiliency layers

### In-memory sending queue

Buffers transient downstream failures and works with retries. Data can still be lost when the queue fills, retry limits expire, or the Collector terminates.

### Persistent sending queue

A storage extension can back the sending queue with a write-ahead log so queued data survives Collector restarts. It introduces disk capacity, permissions, corruption, and lifecycle requirements.

```yaml
extensions:
  file_storage:
    directory: /var/lib/otelcol/storage

exporters:
  otlp:
    endpoint: telemetry-backend.example:4317
    sending_queue:
      storage: file_storage

service:
  extensions: [file_storage]
```

Treat the directory, retention, queue size, and retry duration as workload-specific settings.

### External message queue

An external queue can decouple Collector tiers and provide stronger durability across outages. It also creates another production system with its own availability, retention, security, ordering, and capacity requirements. Add it only when the required durability and failure isolation justify the operational cost.

## Data-loss checklist

Check for:

- Downstream unavailability exceeding retry duration.
- Full sending queues or persistent storage.
- Collector restart with only in-memory buffering.
- Disk failure or exhausted persistent storage.
- External queue outage or retention expiration.
- Receiver, processor, exporter, or routing misconfiguration.
- Sampling or filtering that intentionally discards data.
- Load-balancing that splits state required by a processor.
- Backend rejection, throttling, or duplicate metric writers.

## Transformation safety

Transformations can normalize, enrich, redact, filter, or route telemetry. Before applying one:

1. Define the exact operational purpose.
2. Identify affected signals and attributes.
3. Preserve resource identity and semantic meaning.
4. Quantify records that will be dropped or rewritten.
5. Test representative and malformed input.
6. Monitor transform errors and output volume after rollout.

Prefer allowlists for sensitive attributes and explicit filters for unwanted data. Avoid transformations that silently collapse distinct metric streams or break trace correlation.

## Troubleshooting sequence

Diagnose from source to destination:

1. Confirm the source is producing the expected signal.
2. Confirm network reachability and protocol compatibility to the receiver.
3. Confirm the receiver accepts records and attaches expected resource data.
4. Inspect processor refusals, errors, sampling, filtering, and transformations.
5. Inspect queue occupancy, retries, enqueue failures, and storage health.
6. Inspect exporter errors, TLS, authentication, endpoint, and timeouts.
7. Confirm the backend accepts, indexes, and exposes the data.

Useful non-destructive actions include validating the active configuration, raising Collector log detail temporarily, using diagnostic extensions or a debug exporter in a controlled environment, and comparing accepted versus exported counts. Do not enable verbose telemetry in production without considering sensitive data and volume.

## Change verification

- Validate configuration before restart.
- Roll out to a limited Collector subset when possible.
- Compare accepted, dropped, queued, retried, and exported telemetry before and after.
- Confirm resource identity, trace completeness, metric continuity, and log timestamps.
- Confirm rollback conditions and configuration are ready.

## Official sources

- [Collector installation](https://opentelemetry.io/docs/collector/install/)
- [Collector internal telemetry](https://opentelemetry.io/docs/collector/internal-telemetry/)
- [Collector management](https://opentelemetry.io/docs/collector/management/)
- [Scaling the Collector](https://opentelemetry.io/docs/collector/scaling/)
- [Collector resiliency](https://opentelemetry.io/docs/collector/resiliency/)
- [Transforming telemetry](https://opentelemetry.io/docs/collector/transforming-telemetry/)
- [Collector troubleshooting](https://opentelemetry.io/docs/collector/troubleshooting/)
- [Collector registry](https://opentelemetry.io/docs/collector/registry/)
