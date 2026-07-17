# OpenTelemetry Security

Use this reference for Collector hardening, sensitive-data controls, context trust boundaries, and security review. OpenTelemetry cannot decide which data is sensitive for a particular organization; that responsibility remains with the operator.

## Security objectives

- Minimize telemetry collection to data with an explicit observability purpose.
- Protect telemetry in transit, in memory, on disk, and in the backend.
- Restrict Collector listeners and administrative endpoints.
- Authenticate peers and authorize access.
- Run with the least filesystem, network, Kubernetes, and kernel privilege.
- Prevent resource exhaustion and uncontrolled cardinality.
- Keep credentials out of configuration files and telemetry.
- Monitor current OpenTelemetry security advisories.

## Sensitive data

Potentially sensitive telemetry includes personal information, credentials, session tokens, financial or health data, user behavior, request and response content, database statements, URLs, headers, logs, and baggage.

Apply controls in this order:

1. Do not collect unnecessary data.
2. Prefer aggregation, truncation, or categorization over unique identifiers.
3. Use an allowlist when the acceptable attribute set is known.
4. Remove or mask sensitive values before they cross a trust boundary.
5. Restrict access and retention for telemetry that must remain identifiable.
6. Periodically inspect actual emitted telemetry because instrumentation and schemas change.

Hashing does not automatically anonymize predictable values. A small or enumerable input space can permit reversal by guessing. Document the threat model before treating hashing as a privacy control.

## Collector network hardening

- Bind server-like components to the narrowest required interface. Prefer loopback for local-only clients.
- Do not expose receivers, health endpoints, diagnostics, or management endpoints to the public internet without an explicit design.
- Use TLS for network hops that cross trust boundaries.
- Authenticate receivers and exporters where supported.
- Restrict inbound and outbound traffic with platform network controls.
- Review trust separately for application-to-agent, agent-to-gateway, and gateway-to-backend hops.

An illustrative local-only receiver is:

```yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 127.0.0.1:4317
```

Container and Kubernetes networking can make loopback inappropriate for cross-container traffic. Select the interface from the actual topology rather than replacing it with unrestricted `0.0.0.0` by default.

## Secrets and configuration

- Store secrets in the deployment platform's protected secret mechanism.
- Inject secret values at runtime; do not commit them in Collector YAML.
- Restrict read access to configuration, certificates, queues, WAL directories, and raw telemetry.
- Avoid printing resolved configuration or verbose telemetry where secrets may appear.
- Rotate credentials and certificates without requiring broad unrelated configuration changes.

Use placeholders in examples:

```yaml
exporters:
  otlp:
    endpoint: telemetry-backend.example:4317
    headers:
      authorization: ${env:OTEL_EXPORTER_AUTHORIZATION}
```

## Least privilege

- Avoid running the Collector as root unless a required data source cannot be accessed otherwise.
- Grant read-only filesystem mounts when collection does not require writes.
- Scope Kubernetes RBAC to the resources and verbs required by enabled receivers, processors, observers, or the Operator.
- Review observer and service-discovery extensions because discovery can require broad environment visibility.
- For OBI/eBPF, grant only capabilities required by enabled modes and document any use of powerful capabilities.

## Resource-exhaustion controls

- Set workload CPU and memory requests and limits.
- Put the memory limiter early in pipelines.
- Bound exporter queues and retry duration.
- Filter telemetry that has no operational value.
- Control metric and log cardinality.
- Rate-limit or isolate untrusted senders.
- Alert on refusal, queue saturation, export failure, CPU, memory, disk, and restart signals.

Scaling does not protect a saturated backend and can amplify a denial-of-service condition. Verify the constrained component before scaling.

## Context and baggage boundaries

- Treat incoming trace context as untrusted unless the source is authenticated and authorized.
- Define whether external trace context is accepted, replaced, or sanitized.
- Prevent internal trace identifiers or baggage from being forwarded to untrusted external services when disclosure is unacceptable.
- Never store credentials, API keys, session tokens, or personal data in baggage.
- Remember that baggage has no built-in guarantee that a value originated from a trusted service.

## Security review checklist

1. Map data sources, Collector tiers, destinations, and trust boundaries.
2. Inventory listeners, protocols, addresses, ports, and administrative endpoints.
3. Verify TLS, authentication, and authorization for each network hop.
4. Inspect configuration and secret delivery.
5. Inventory attributes, log bodies, baggage, and transformed data for sensitivity.
6. Review filtering, redaction, and failure behavior.
7. Review filesystem, RBAC, container, and kernel privileges.
8. Review resource limits, queue bounds, and abuse controls.
9. Verify internal telemetry and security-alert ownership.
10. Check current CVEs and advisories for deployed components and versions.

## Official sources

- [OpenTelemetry security](https://opentelemetry.io/docs/security/)
- [Collector configuration security](https://opentelemetry.io/docs/security/config-best-practices/)
- [Collector hosting security](https://opentelemetry.io/docs/security/hosting-best-practices/)
- [Handling sensitive data](https://opentelemetry.io/docs/security/handling-sensitive-data/)
- [OpenTelemetry CVEs](https://opentelemetry.io/docs/security/cve/)
- [Context propagation security](https://opentelemetry.io/docs/concepts/context-propagation/#security-best-practices)
- [Baggage security considerations](https://opentelemetry.io/docs/concepts/signals/baggage/#baggage-security-considerations)
