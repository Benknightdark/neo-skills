# Platforms and Zero-Code Instrumentation

Use this reference when telemetry must be added or operated without editing application source. Do not turn it into language-specific integration guidance.

## Zero-code model

Zero-code instrumentation adds telemetry capabilities without application source changes. Depending on the environment, it can use runtime agents, process injection, platform hooks, bytecode techniques, monkey patching, or eBPF.

It commonly captures framework-visible activity such as inbound and outbound requests, database calls, and messaging operations. It generally cannot infer custom business events, application-specific attributes, or arbitrary internal operations that are not visible to the mechanism.

Operational configuration usually includes:

- Service and resource identity.
- Enabled instrumentations or observed protocols.
- Export destination and transport.
- Propagators and context behavior.
- Sampling and signal enablement.
- Resource limits and performance controls.

Verify current support for the target language, runtime, framework, operating system, and deployment platform. Do not infer support from a different runtime.

## Selection guide

| Approach | Best fit | Main trade-offs |
| --- | --- | --- |
| Runtime or language agent | Supported runtimes where library-level operations must be observed without source changes | Runtime-specific support, startup and performance impact, version compatibility |
| Kubernetes Operator injection | Centrally managed Kubernetes workloads with supported automatic-instrumentation images | Admission/injection policy, image lifecycle, resource overhead, rollout coordination |
| OBI/eBPF | Linux environments requiring protocol and network visibility without process-level source changes | Kernel, architecture, privileges, protocol visibility, and application-detail limitations |
| FaaS layer | Supported serverless runtimes where a published instrumentation or Collector layer is available | Cold-start impact, regional artifacts, layer lifecycle, limited runtime control |
| Collector-only infrastructure collection | Host, container, Kubernetes, network, and existing log or metric sources | Does not create application-internal spans that the Collector cannot observe |

## Kubernetes

Choose the Collector mode based on the data source and processing requirement:

- DaemonSet for node-local collection such as host metrics and node logs.
- Sidecar when a workload requires strong local isolation or per-workload collection behavior.
- Deployment or StatefulSet for shared gateways, central processing, or components with identity/state requirements.

The OpenTelemetry Operator can manage Collector custom resources and inject supported automatic instrumentation. Helm charts provide another declarative deployment mechanism. Treat Operator and chart versions as time-sensitive and verify their current custom-resource fields and defaults.

### Prometheus collection

Avoid having multiple Collectors scrape the same target. The Target Allocator separates target discovery from collection and distributes Prometheus targets across Collector instances. Verify the reconciled configuration because enabling allocation can replace existing service-discovery entries with allocator-provided discovery.

### Horizontal scaling

Before enabling autoscaling:

1. Set realistic CPU and memory requests and limits.
2. Confirm the metrics source used by the autoscaler.
3. Choose signals that reflect Collector pressure rather than only host utilization.
4. Preserve stateful-routing requirements.
5. Set minimum capacity for failure tolerance and maximum capacity for backend protection.

## OpenTelemetry eBPF Instrumentation (OBI)

OBI observes Linux application executables and networking with eBPF and can emit application, network, trace, metric, and correlation data without source changes. Its precise protocol coverage, feature status, artifacts, kernel requirements, and supported architectures change over time; verify the current OBI documentation.

Selection constraints:

- Linux kernel and BTF compatibility.
- Supported CPU architecture.
- Access to process, network, and kernel interfaces.
- Required Linux capabilities for the enabled features.
- Visibility limits for encrypted, asynchronous, runtime-specific, or application-specific behavior.
- Cardinality and telemetry-volume controls.

Use least privilege. Prefer the exact capabilities required by enabled features over unrestricted root access. Treat `CAP_SYS_ADMIN` and host-level access as high-risk and document why they are needed.

OBI is not a substitute for custom business telemetry. If the requirement depends on application semantics that OBI cannot observe, identify that limitation without generating manual instrumentation code.

## FaaS

Serverless environments have platform-specific lifecycle, startup, networking, and packaging constraints. For supported Lambda layers:

- Confirm the layer exists for the runtime and region.
- Account for initialization and cold-start overhead.
- Add a Collector layer or verified external Collector path when the instrumentation layer requires it.
- Configure secrets through the platform secret mechanism or protected environment injection.
- Verify the transport, endpoint, and layer compatibility before rollout.
- Publish and test a new function version with rollback available.

Do not copy version numbers or layer ARNs from a snapshot. Resolve the current official release for the target region at execution time.

## Rollout checklist

1. Inventory platform, runtime, kernel, architecture, and workload restrictions.
2. Confirm the zero-code method supports the target.
3. Define expected signals and known blind spots.
4. Establish service/resource identity and export path.
5. Review privileges, network exposure, and secrets.
6. Measure startup, CPU, memory, latency, and telemetry volume on a limited rollout.
7. Verify trace continuity, metric cardinality, log correlation, and backend ingestion.
8. Document rollback and upgrade ownership.

## Official sources

- [Zero-code instrumentation concept](https://opentelemetry.io/docs/concepts/instrumentation/zero-code/)
- [Zero-code instrumentation documentation](https://opentelemetry.io/docs/zero-code/)
- [OpenTelemetry eBPF Instrumentation](https://opentelemetry.io/docs/zero-code/obi/)
- [OBI security, permissions, and capabilities](https://opentelemetry.io/docs/zero-code/obi/security/)
- [OpenTelemetry with Kubernetes](https://opentelemetry.io/docs/platforms/kubernetes/)
- [OpenTelemetry Operator](https://opentelemetry.io/docs/platforms/kubernetes/operator/)
- [Target Allocator](https://opentelemetry.io/docs/platforms/kubernetes/operator/target-allocator/)
- [Functions as a Service](https://opentelemetry.io/docs/platforms/faas/)
- [Lambda auto-instrumentation](https://opentelemetry.io/docs/platforms/faas/lambda-auto-instrument/)
- [Lambda Collector configuration](https://opentelemetry.io/docs/platforms/faas/lambda-collector/)
