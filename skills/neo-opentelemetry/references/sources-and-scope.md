# Sources, Scope, and Currency

## Source snapshot

This skill was derived from the English OpenTelemetry documentation stored at:

- Repository: `https://github.com/open-telemetry/opentelemetry.io`
- Source subtree: `content/en/docs`
- Revision: `b18eb4d01fab9be2c5c22b1aaafdeb23ba97e3d4`
- Revision timestamp: `2026-07-17T02:20:14Z`
- Documentation root: `https://opentelemetry.io/docs/`

The source subtree contained 423 Markdown files at generation time. The material was curated and rewritten rather than copied wholesale.

## Included source areas

- `what-is-opentelemetry.md`
- Non-programming material from `concepts/`
- Collector architecture, components, configuration, installation, deployment, management, internal telemetry, resiliency, scaling, transformation, troubleshooting, distributions, benchmarks, and registry material
- Operational material from `getting-started/ops.md`
- Prometheus interoperability and migration concepts from `compatibility/`
- Non-programming platform blueprints and reference-implementation lessons from `guidance/`
- Kubernetes, FaaS automatic instrumentation, and operational platform material from `platforms/`
- Security and sensitive-data material from `security/`
- Zero-code and OBI operational material from `zero-code/`
- Non-programming demo architecture or operational lessons only when they clarify an included concept

## Excluded source areas

- All language API and SDK instructions under `languages/`
- Code-based instrumentation and language-library integration
- Developer getting-started and reference-application implementation material
- Collector source builds, Collector Builder, and custom component development under `collector/extend/`
- Manual FaaS instrumentation
- Demo service source, development, tests, and manual span examples
- Contribution workflow and website-development documentation
- API, SDK, data-model implementation, and programming-oriented specification pages
- Source-code snippets in Java, C#, Go, JavaScript, TypeScript, Python, PHP, Ruby, Rust, Swift, C++, and other programming languages

Mixed pages were reduced to concepts, declarative YAML or JSON configuration, environment variables, and operational shell, Docker, cloud, or Kubernetes commands. High-level references to an API or SDK may remain only when needed to state a system boundary or migration limitation; this skill never provides their programming interface.

## Currency policy

The snapshot is evidence for the content as of its revision. It is not evidence that a version, status, default, component, platform matrix, security advisory, image, package, or command remains current.

Verify against official sources before answering time-sensitive questions about:

- Collector, Operator, Helm, OBI, FaaS layer, or semantic-convention versions.
- Signal or component maturity.
- Component availability in a distribution.
- Runtime, platform, kernel, architecture, or protocol support.
- Default endpoints, limits, queue behavior, or feature gates.
- CVEs, security advisories, and mitigations.
- Migration shims and compatibility guarantees.

If current verification is unavailable, state:

1. The claim is based on revision `b18eb4d01fab9be2c5c22b1aaafdeb23ba97e3d4`.
2. Current status cannot be confirmed.
3. The official page the user should verify.
