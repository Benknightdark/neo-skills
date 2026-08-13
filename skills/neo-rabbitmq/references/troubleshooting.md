# Layered RabbitMQ Troubleshooting

Use this reference as a language-neutral investigation process based on RabbitMQ 4.3 troubleshooting documentation. The primary sources are troubleshooting/index.md, troubleshooting-networking.md, troubleshooting-ssl.md, troubleshooting-oauth2.md, monitoring/index.md, memory-use/index.md, connections/index.md, channels/index.md, publishers/index.md, alarms.md, and flow-control.md.

## Troubleshooting Loop

1. Describe observable symptoms: affected Virtual Host, Queue, Connection, Node, time range, error messages, latency, and affected operations.
2. Confirm the version and change context: RabbitMQ, Erlang, Plugins, Feature Flags, configuration, deployment, certificates, network, and recent changes.
3. Collect read-only evidence: health checks, alarms, Listeners, logs, Cluster status, Queue metrics, Connections, Channels, Publishers, Consumers, memory, and disk.
4. Isolate by layer: Client or network, Listener, TLS, Authentication, Authorization, Cluster, Resource Alarm, Exchange routing, Queue, Publisher, Consumer, or application processing.
5. Change only after the failing layer is supported by evidence. Reproduce first in a small scope or non-production environment and record rollback settings.
6. Verify again using the original symptom, health status, metrics, logs, and business outcome. Confirm that the failure was not moved to another layer.

A report that only says very slow, cannot connect, or Queue is growing lacks the time, scope, version, and metrics required for a safe root-cause determination.

## Symptom-Based Checks

### Publisher Blocked or Throughput Reduced

Check Memory Alarm, Disk Alarm, Flow Control, disk latency, Queue backlog, Consumer Ack rate, Publisher Confirm latency, and network first. A Resource Alarm blocks publishing Connections, and a cluster alarm can affect multiple nodes.

Do not begin by raising Memory Threshold, Disk Threshold, or Publisher concurrency. Reduce input or restore downstream consumption, identify the source of memory, disk, and message backlog, and then decide whether capacity or configuration changes are justified.

### Queue Backlog or Consumer Falling Behind

Check in order:

- Whether Exchanges and Bindings route messages to the expected Queue.
- Whether Publisher Rate remains above Deliver Rate or Ack Rate.
- Consumer Capacity, Consumer count, processing time, Prefetch, and unacknowledged messages.
- Redelivery, Negative Acknowledgement, Retry, Dead Lettering, and Requeue Loops.
- Queue type, replication, disk, resource alarms, and cross-node data placement.

Add Consumers only when Consumer processing capacity or concurrency is a proven bottleneck. If the bottleneck is Publisher input, disk, routing, or Requeue, adding Consumers can worsen the problem.

### Routing or Message-Loss Concern

Confirm the Virtual Host, Exchange name, Exchange type, Bindings, Routing Key, Queue state, and Unroutable Message handling used by the Publisher. Check separately whether the message was routed, the Broker accepted the publish, the Publisher received a Confirm, and the Consumer completed business processing.

### Repeated Connection or Channel Interruptions

Distinguish DNS, TCP Listener, Firewall, TLS, Authentication, Authorization, Heartbeat, Broker-initiated closure, Resource Alarms, and Client reconnect behavior first. Check Connection or Channel Churn, File Descriptors, Protocol Exceptions in logs, node resources, and reconnect spikes.

Do not attribute every disconnect to Heartbeat. Verify low Heartbeat settings, network congestion, host load, TLS certificates, permissions, and Broker closure reasons separately.

### Memory or Disk Rising Continuously

Use Memory Breakdown to separate Connections, Queues, Message Store, Plugins, Management Stats, Binaries, Processes, and other categories. Compare them with Queue Depth, unacknowledged messages, message size, Connection count, Channel count, Plugins, and monitoring frequency.

For disk troubleshooting, check the Broker database partition, free space, message Paging, Queue or Quorum Segments, Snapshots, logs, and other host processes together. Do not inspect only total container filesystem capacity.

### Unhealthy Cluster or Replicas

Confirm Node Names, Peer Discovery, inter-node authentication, DNS, time synchronization, Firewall rules, Feature Flags, Metadata Store, Queue or Stream members, Leaders, quorum, and current maintenance actions. Before stopping a node, identify which objects would lose an online quorum.

A Client connection to one node does not prove cluster health. Check cluster membership, alarms, Replicas, and the state of critical Queues or Streams as well.

## CLI and Evidence Rules

- When rabbitmqctl, rabbitmq-diagnostics, rabbitmq-plugins, or rabbitmq-queues commands are needed, read help for the target installation first and use syntax appropriate for the version.
- Use rabbitmqadmin only for management, health, Definitions, or metric operations covered by the source documentation. Never recommend rabbitmqadmin publish or rabbitmqadmin get.
- Mask Hostnames, IP addresses, users, Tokens, Cookies, certificates, and message contents before reporting command output. Never paste real secrets into documentation or Tickets.
- Start with read-only checks such as status, alarms, Listeners, metrics, logs, and object lists. Evaluate clearing, deletion, requeue, Connection closure, node shutdown, and configuration changes as separate actions.
- Record the expected observation, actual observation, supported or eliminated hypothesis, and next check for every troubleshooting step.

## Rollback and Verification

After a change, verify at least:

- The original error no longer appears, with no new Protocol Exception, Authentication Failure, or TLS Failure.
- Alarms and Flow Control are cleared or show a clear improving trend.
- Publish, Route, Confirm, Deliver, Ack, Redelivery, and Consumer Capacity return to the expected range.
- Queue Depth, unacknowledged messages, memory, disk, Connections, Channels, and network do not become a new anomaly.
- Cluster, Queue, or Stream Replicas, Leaders, Listeners, Health Checks, and Readiness meet the deployment target.
- Rollback settings, backups, change records, and follow-up monitoring ownership are confirmed.

### Sources

- [Troubleshooting Guidance](https://www.rabbitmq.com/docs/4.3/troubleshooting)
- [Troubleshooting Network Connectivity](https://www.rabbitmq.com/docs/4.3/troubleshooting-networking)
- [Monitoring](https://www.rabbitmq.com/docs/4.3/monitoring)
- [Reasoning About Memory Usage](https://www.rabbitmq.com/docs/4.3/memory-use)
- [Publishers](https://www.rabbitmq.com/docs/4.3/publishers)
- [Memory and Disk Alarms](https://www.rabbitmq.com/docs/4.3/alarms)
