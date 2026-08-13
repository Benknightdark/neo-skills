# RabbitMQ Operations and Management

Use this reference for RabbitMQ 4.3 Broker management. The primary sources are configure.md, manage-rabbitmq.md, cli.md, management-cli.md, management/index.md, definitions.md, plugins.md, access-control.md, vhosts.md, policies.md, clustering.md, cluster-formation.md, networking.md, ssl/index.md, backup.md, snapshots.md, upgrade.md, rolling-upgrade.md, and production-checklist.md.

## Operations Lifecycle

Treat inventory, change, verification, and rollback as the minimum closed loop for every operation:

1. Inventory RabbitMQ, Erlang, Plugins, Feature Flags, node names, Cluster members, Listeners, Virtual Hosts, users, Policies, Queue types, and current alarms.
2. Confirm the target, affected nodes, change window, backup or Definitions Export, rollback path, and success criteria.
3. Run read-only checks first, then apply the smallest-scope change. Do not modify several unverified settings together.
4. Recheck health, alarms, Listeners, routing, Publishers, Consumers, and critical business metrics. Preserve evidence of the change.

If data is insufficient, do not provide a one-step restart, deletion, clearing, or upgrade procedure. Request the environment version, topology, backup state, and maintenance-window information first.

## Configuration and CLI

- Manage primary Broker settings through rabbitmq.conf or .conf files in the configuration directory. Use advanced.config only when the corresponding configuration format is required. For configuration questions, confirm the file location, load method, and node scope first.
- Use rabbitmqctl for service management and general Broker operations, rabbitmq-diagnostics for diagnostics and health checks, rabbitmq-plugins for Plugin management, and rabbitmq-queues for Queue-related administration. Treat the help output for the target version as authoritative for subcommands.
- rabbitmqadmin v2 uses the HTTP API for object management, health checks, Definitions, and some operational tasks. It does not replace the core CLI tools. Do not use the explicitly excluded rabbitmqadmin publish or rabbitmqadmin get production operations.
- Use restricted accounts for CLI, HTTP API, and Management UI. Never put passwords, Tokens, Cookies, private keys, or personal information in commands, documentation, logs, or examples.

## Management, Permissions, and Isolation

- The Management Plugin provides a UI, HTTP API, metrics, and some management operations. Separate read-write management accounts from read-only monitoring accounts and grant only the required Virtual Host scope.
- A Virtual Host is a logical isolation boundary for Connections, Exchanges, Queues, Bindings, permissions, and some Policies. Do not use naming alone to separate tenants or systems with different lifecycles.
- Authentication and Authorization are separate controls. First confirm how a user is authenticated, then confirm what the user can do in the target Virtual Host.
- When enabling TLS, check the Server Certificate, Trust Store, Peer Verification, Hostname, Listener, certificate rotation, and Client compatibility together. A working TCP connection is not enough.
- Check inter-node and CLI tool authentication, DNS, time synchronization, Firewall rules, and required Listeners together. A working TLS Client connection does not prove that inter-node communication is secure or available.

## Policies, Definitions, and Plugins

- Use a Policy to apply runtime settings to a group of Queues, Streams, or Exchanges. Policies suit settings that change or must remain consistent across a group.
- A Policy cannot change Queue or Stream types or other creation-time semantics. Handle those choices in topology versioning and migration plans.
- Definitions contain Users, Virtual Hosts, Queues, Exchanges, Bindings, Runtime Parameters, and other topology metadata. A Definitions Export can support topology backup, migration, or data seeding, but it is not a backup of Queue message contents.
- Before enabling a Plugin, confirm its support level, version compatibility, resource cost, Listeners, permissions, monitoring, and disablement rollback. Do not enable an unnecessary Plugin because the UI offers it.

## Cluster and Node Maintenance

- Cluster membership, metadata, and Queue or Stream Replica scope are different concerns. Distinguish cluster membership, Definitions replication, and message-data replication.
- Cluster design must check Node Names, Peer Discovery, Erlang Cookie or equivalent authentication, DNS, Firewall rules, time synchronization, Leader or Replica placement, Client connection distribution, and quorum conditions.
- RabbitMQ 4.3 cluster documentation emphasizes odd node counts and discourages two-node clusters. Validate the node count against Queue or Stream replication factors, failure model, capacity, and maintenance strategy.
- Adding nodes does not automatically solve throughput problems. Metadata changes, cross-node routing, replication, Connection distribution, and data placement can add new costs.
- Before node maintenance, confirm that no object would lose quorum or a required Replica. Follow the applicable Queue, Stream, and upgrade documentation. Do not stop a node without health evidence.

## Backup, Upgrade, and Rollback

- Treat Definitions, Broker configuration, certificates, and message data as separate backup targets. Confirm the recovery scope and recovery-test result for each backup type.
- Use a Rolling Upgrade only when the source and target versions, Erlang versions, Feature Flags, Plugins, cluster health, and capacity conditions all qualify.
- Before an upgrade, read the Release Notes from the current version through the target version. Check the Upgrade Path, Erlang requirements, stable Feature Flags, package dependencies, cluster capacity, backups, and rollback plan.
- Upgrade nodes one at a time: stop, upgrade, start, and verify each node. At every step, check cluster state, Queue or Stream safety, Listeners, Publishers, Consumers, and alarms.
- Enable new Feature Flags or remove compatibility settings only after every verification condition passes. Keep a feasible path back to the last verified version.

## Production Minimum Checks

- Use durable storage and check free disk, storage isolation, filesystem behavior, I/O capability, and backup strategy.
- Check RAM, Memory Alarms, Disk Alarms, File Descriptors, CPU, network throughput, Connections, Channels, Queues, message rates, and log collection.
- Use TLS, least privilege, restricted Firewalls, non-public Management endpoints, rotatable certificates, and monitoring configuration without secrets.
- Have applications reuse long-lived Connections and Channels. Avoid high Connection or Channel Churn, unrestricted polling, and unbounded retries.
- Create executable verification cases for health checks, readiness, alarms, capacity trends, failure recovery, and upgrade rollback.

## Kubernetes Operator

Kubernetes Operator documentation is in the non-versioned kubernetes/operator/ path. For Operator questions, confirm the versions of the Operator, RabbitMQ Cluster Operator, Topology Operator, Kubernetes, and RabbitMQ first. Verify CRDs, storage, TLS, monitoring, Pod Disruption, upgrades, and Operator logs separately. Do not treat Operator documentation as a replacement for versioned RabbitMQ 4.3 Broker documentation.

### Sources

- [Configuration](https://www.rabbitmq.com/docs/4.3/configure)
- [Command Line Tools](https://www.rabbitmq.com/docs/4.3/cli)
- [Management Plugin](https://www.rabbitmq.com/docs/4.3/management)
- [Authentication, Authorization, and Access Control](https://www.rabbitmq.com/docs/4.3/access-control)
- [Virtual Hosts](https://www.rabbitmq.com/docs/4.3/vhosts)
- [Policies](https://www.rabbitmq.com/docs/4.3/policies)
- [Clustering Guide](https://www.rabbitmq.com/docs/4.3/clustering)
- [TLS Support](https://www.rabbitmq.com/docs/4.3/ssl)
- [Rolling Upgrade](https://www.rabbitmq.com/docs/4.3/rolling-upgrade)
- [Production Deployment Guidelines](https://www.rabbitmq.com/docs/4.3/production-checklist)
