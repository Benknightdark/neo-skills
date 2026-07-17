# Collector Architecture and Configuration

Use this reference to choose a Collector topology or review declarative Collector configuration. Component availability and configuration keys vary by distribution and version; verify them in the current component documentation.

## Pipeline model

A Collector pipeline moves one signal type through:

1. Receivers that accept or obtain telemetry.
2. Optional processors that transform, enrich, batch, sample, filter, or drop telemetry.
3. Exporters that send telemetry to a destination.

Connectors join two pipelines while acting as an exporter for one and a receiver for another. Extensions add operational capabilities such as health checks, storage, authentication, or service discovery and are enabled separately from telemetry pipelines.

A minimal declarative shape is:

```yaml
receivers:
  otlp:
    protocols:
      grpc:

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 512
  batch:

exporters:
  otlp:
    endpoint: telemetry-backend.example:4317

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [otlp]
```

This is a structural example, not a production-ready universal default. Authentication, TLS, listener addresses, queueing, resource limits, and component support must be decided for the target environment.

## Configuration mechanics

- Define components at the top level, then activate them by referencing them from a pipeline or the service extension list.
- Use `type/name` identifiers when more than one instance of a component type is needed.
- A defined component that is not referenced by `service` is not enabled.
- Signal types in a pipeline must be supported by every referenced component.
- Processor order is behaviorally significant.
- Multiple configuration sources can be merged, but the merged result must still be complete.
- Use environment-variable substitution for deployment-supplied values; never embed secrets in the Skill, repository examples, or review output.

Validate before deployment:

```shell
otelcol validate --config=collector.yaml
```

Confirm the executable and subcommand for the selected Collector distribution rather than assuming every distribution uses the same binary name.

## Reuse and fan-out gotcha

A receiver can feed multiple pipelines and an exporter can receive from multiple pipelines. Receiver fan-out is synchronous: a blocking processor in one attached pipeline can block the other pipelines and the receiver. Do not reuse a receiver across pipelines without evaluating this failure coupling.

Processors referenced by multiple pipelines use the same configuration but each pipeline gets its own processor instance and state.

## Deployment patterns

### No Collector

Direct export has the fewest moving parts but couples telemetry delivery and backend changes to the instrumented workload. Use it for simple development or constrained cases only after accepting the limited processing, exporter, and operational flexibility.

### Agent

An agent runs close to workloads, commonly as a host process, sidecar, or Kubernetes DaemonSet.

Choose an agent when you need:

- Host-local metrics or logs.
- Local enrichment with host or Kubernetes resource attributes.
- A stable local telemetry destination.
- Reduced application responsibility for credentials and backend export.

Agents multiply configuration and resource overhead across hosts or workloads. Keep their processing focused.

### Gateway

A gateway is a standalone Collector service shared by multiple telemetry sources.

Choose a gateway when you need:

- Centralized credentials, filtering, transformation, or policy.
- Central processing that must observe traffic from multiple sources.
- Independent scaling of telemetry processing.
- A controlled egress point to external backends.

Gateways add a network hop and a shared failure domain. Load balance stateless gateways and monitor them as production services.

### Agent to gateway

Combine agents and gateways when both local collection and centralized processing are required. Typical separation:

- Agents: local reception, host collection, resource detection, memory protection, and efficient forwarding.
- Gateways: centralized filtering, tail sampling, batching, credentials, and resilient export.

This pattern is justified by identified needs such as network isolation, host telemetry, central policy, trace-aware sampling, or scale. It is not the default for small deployments.

## Stateful routing rules

- Tail sampling requires all spans for a trace to reach the same decision-making instance.
- Cumulative-to-delta conversion and some aggregation use cases also require data-aware routing.
- Prometheus scraping requires target allocation or sharding to avoid duplicate collection.
- Metric streams must preserve the single-writer principle and globally unique identities.
- Standard layer-4 load balancing can be ineffective for persistent gRPC connections; verify that the load-balancing method distributes the actual connection pattern.

## Configuration review checklist

1. Identify each enabled pipeline and its signal type.
2. Verify every referenced component exists in the selected distribution.
3. Trace data from each receiver through processors to every exporter.
4. Inspect processor order and intentional data drops.
5. Check listener scope, authentication, TLS, and secret injection.
6. Check memory limiting, batching, queueing, retry, and persistent storage requirements.
7. Check stateful processors and their routing assumptions.
8. Check resource identity and duplicate-writer risk.
9. Check Collector internal telemetry, health checks, and alerting.
10. Validate the merged configuration with the target executable.

## Official sources

- [Collector architecture](https://opentelemetry.io/docs/collector/architecture/)
- [Collector configuration](https://opentelemetry.io/docs/collector/configuration/)
- [Collector components](https://opentelemetry.io/docs/collector/components/)
- [Choose a deployment pattern](https://opentelemetry.io/docs/collector/deploy/choose/)
- [Agent deployment pattern](https://opentelemetry.io/docs/collector/deploy/agent/)
- [Gateway deployment pattern](https://opentelemetry.io/docs/collector/deploy/gateway/)
- [Agent-to-gateway deployment pattern](https://opentelemetry.io/docs/collector/deploy/other/agent-to-gateway/)
- [No Collector](https://opentelemetry.io/docs/collector/deploy/other/no-collector/)
