# RabbitMQ Sources and Scope

## Default Version

Use the stable RabbitMQ 4.3 documentation as the default knowledge baseline for this skill:

- Source directory: rabbitmq-website/versioned_docs/version-4.3
- Source repository: rabbitmq-website
- Source snapshot: 2b61ea8d840a42e1ba46ee2f1fdf0f9aeec63bd9
- In the same source repository, docs is the 4.4 development version, not the default version for this skill.
- versioned_docs/version-4.2, versioned_docs/version-4.1, versioned_docs/version-4.0, and versioned_docs/version-3.13 are older versions; switch to them only when the user explicitly specifies one.

The source repository README identifies 4.3 as the stable documentation path and docs as the 4.4 development version. Because versioned documentation shares the website repository, use the correct version directory instead of relying on docs alone.

## Topic Map

| Topic | Primary source paths |
| :--- | :--- |
| Protocols and message semantics | amqp.md, protocols.md, exchanges.md, queues.md, consumers.md, publishers/index.md, confirms.md, reliability.md |
| Queue types and data structures | classic-queues.md, quorum-queues/index.md, streams.md, stream.md, stream-connections.md, stream-filtering.md |
| Message lifecycle | ttl.md, dlx.md, nack.md, consumer-prefetch.md, consumer-priority.md, flow-control.md |
| Broker configuration and management | configure.md, manage-rabbitmq.md, cli.md, management-cli.md, management/index.md, plugins.md, definitions.md |
| Security and isolation | access-control.md, vhosts.md, ssl/index.md, ldap.md, oauth2.md, networking.md |
| Clusters and maintenance | clustering.md, cluster-formation.md, feature-flags/index.md, backup.md, snapshots.md, upgrade.md, rolling-upgrade.md |
| Monitoring and performance | monitoring/index.md, prometheus/index.md, production-checklist.md, memory.md, memory-use/index.md, connections/index.md, channels/index.md, alarms.md, disk-alarms.md, limits.md |
| Troubleshooting | troubleshooting/index.md, troubleshooting-networking.md, troubleshooting-ssl.md, troubleshooting-oauth2.md |
| Kubernetes operations | Non-versioned kubernetes/operator/ |

## Explicit Exclusions

- Do not include Java, Python, C#, Go, Ruby, or other language examples from tutorials/ and client-libraries/. Retain only protocol, topology, reliability, and operations semantics.
- Do not include blog/. The source README states that Blog content is outside the RabbitMQ documentation license scope and that Blog articles may not be redistributed.
- Do not include Docusaurus, React, CSS, website components, deployment infrastructure, or ci/; these are not RabbitMQ Broker development, operations, or performance knowledge.
- Do not use rabbitmqadmin publish or rabbitmqadmin get as production operations. The source Agent Instructions explicitly state that these commands are intentionally omitted.
- Do not copy the entire website. References are concise knowledge rewritten by topic; source paths provide traceability and verification.

## License and Attribution

The RabbitMQ website README states that the documentation is available under the Apache License 2.0 and Mozilla Public License 2.0. Users may choose either license subject to its terms. The README also excludes Blog content and states that Broadcom retains its intellectual property. This skill summarizes the documentation, preserves the source repository, version directory, commit identifier, and official documentation links, and does not treat Blog or other excluded material as part of the documentation license.

## Freshness Policy

The source snapshot provides a traceable baseline but does not guarantee current RabbitMQ behavior. Consult current official documentation or the target environment's tool help before answering questions about:

- Latest versions, support matrices, Release Notes, Feature Flags, Deprecated Features, and upgrade paths.
- CLI subcommands, arguments, configuration keys, defaults, ports, limits, Plugin support, and Kubernetes Operator behavior.
- TLS, OAuth, LDAP, certificates, authentication, CVEs, security advisories, and third-party component status.
- Performance numbers, capacity, latency, monitoring thresholds, and recommendations for a specific host or container environment.

If current-source verification cannot be completed, state explicitly that the answer uses the 4.3 snapshot and list changeable items as pending verification.

### Official Documentation

- [RabbitMQ 4.3 documentation](https://www.rabbitmq.com/docs/4.3)
- [RabbitMQ documentation home](https://www.rabbitmq.com/docs)
- [RabbitMQ website repository](https://github.com/rabbitmq/rabbitmq-website)
