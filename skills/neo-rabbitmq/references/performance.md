# RabbitMQ Performance, Capacity, and Monitoring

Use this reference for RabbitMQ 4.3 performance analysis. The primary sources are production-checklist.md, monitoring/index.md, prometheus/index.md, memory.md, memory-use/index.md, connections/index.md, channels/index.md, flow-control.md, consumer-prefetch.md, publishers/index.md, queues.md, quorum-queues/index.md, streams.md, and alarms.md.

## Establish a Comparable Baseline

Before changing settings, record a stable period of:

- Target SLOs: Publish latency, Confirm latency, Consumer latency, acceptable Queue Depth, acceptable redelivery rate, and availability.
- Workload: message-size distribution, Publish Rate, Deliver Rate, Ack Rate, Confirm Rate, Consumer count, processing time, retries, and traffic-spike patterns.
- Topology: protocol, Virtual Host, Exchange, Binding, Queue type, Durable, TTL, Dead Lettering, replication factor, node count, and Client connection location.
- Broker resources: CPU, RAM, Memory Breakdown, disk capacity, disk latency and throughput, File Descriptors, network throughput, Connections, Channels, Queues, and alarms.
- Application behavior: Connection or Channel Churn, Prefetch, unacknowledged messages, polling, message batching, failed reconnects, redelivery, and Consumer Capacity.

Without a baseline, you cannot tell whether a change improved the system or moved the bottleneck. Mark the data as insufficient instead of providing fixed values.

## Bottleneck Isolation Order

Inspect the end-to-end path before adjusting a parameter:

1. Can the Publisher establish a Connection, complete routing, and receive a Confirm?
2. Do Exchanges and Bindings cause unroutable messages, extra routing, or imbalance?
3. Are Queue storage, disk, replication, TTL, Priority, or message indexes the cost driver?
4. Are Connections, Channels, Flow Control, or the network limiting transport?
5. Does the Consumer have enough processing capacity, suitable Prefetch, appropriate Ack timing, and observable failure retries?
6. Is the Broker in a Memory Alarm, Disk Alarm, or another resource-protection state?

If Queue Depth is growing, the cause may be Consumer processing speed, a Publisher spike, routing errors, a retry loop, disk, replication, or a Connection problem. Treat adding Consumers as a hypothesis to validate, not a conclusion.

## Priority Adjustments

### Connections and Channels

- Prefer long-lived Connections and Channels. Do not create a Connection for every message.
- Observe Connection Count, Channel Count, creation and closure rates, File Descriptors, memory, and network resources.
- When requirements allow, separate Publishers and Consumers onto different Connections so Publisher Flow Control does not delay Consumer acknowledgements.
- For large Connection populations, also check node distribution, Listeners, operating-system limits, TLS cost, and Client reconnect storms.

### Publishers

- Assess data safety through Publisher Confirm latency, negative responses, retries, and Connection-loss behavior, not only the return of a Publish call.
- Streaming Confirms, Batch Publishing, and Publish-and-Wait have different latency, throughput, and memory properties. Select one according to reliability requirements, then measure it with the workload.
- Check Unroutable Message metrics and Exchange Bindings. A Queue without a Consumer or a received Confirm does not prove that business processing completed.
- When a Publisher is blocked by a Resource Alarm or Flow Control, address Broker resources and downstream consumption before increasing concurrency.

### Consumers

- Adjust Prefetch according to message size, processing time, Ack latency, Consumer count, ordering requirements, and memory limits.
- Observe Consumer Capacity, Ready Messages, Unacknowledged Messages, Deliver Rate, Ack Rate, Redelivery Rate, and processing latency.
- Prefetch that is too high can increase unacknowledged messages and memory use; Prefetch that is too low can limit concurrency. Compare throughput, latency, memory, and redelivery after every change.
- Do not replace continuous consumption with polling for performance. Polling usually adds request cost and empty-pull latency.
- If ordering is the priority, evaluate Single Active Consumer, a single Consumer, or partitioned Queues. If retries are the priority, evaluate Delivery Limit, delayed retry, and Dead Lettering.

### Queue Types and Data Paths

- Classic Queue, Quorum Queue, and Stream have different data models, replication, storage, ordering, retention, and consumption behavior. Select by semantics first, then run workload benchmarks.
- Quorum Queue replication, WAL, Segment, Snapshot, Leader, Rebalance, disk, and resource use affect performance. Adjust performance settings only when you observe the corresponding bottleneck.
- Stream Retention, Replica, Leader, Offset, Deduplication, Stream Connection, and Super Stream partitioning change the cost model. Do not apply general Queue tuning assumptions to Streams.
- TTL, Length Limit, Priority, Dead Lettering, and Requeue change Queue workload. Include Priority count, expiration scanning, and repeated enqueueing in resource estimates.

## Memory, Disk, and Alarms

- Use Memory Breakdown to distinguish Connections, Queues, Message Store Index, Plugins, Management Stats, Binaries, Erlang Processes, and other categories. Do not inspect only operating-system RSS.
- Memory Alarms and Disk Alarms block publishing Connections, and cluster alarms can affect the whole cluster. First identify the alarm source node, consumption rate, remaining disk, message Paging, and resource trends.
- The memory Threshold is a protection point that triggers publishing throttling, not a hard limit. In containers or Kubernetes, confirm the effective cgroup limit and Broker configuration.
- Examine disk capacity, disk latency, free space, Queue storage, Quorum Segments, and Snapshots together. A Disk Alarm cannot be solved simply by lowering a limit.
- Reduce input, restore consumption, handle unnecessary backlog according to the data-retention and recovery plan, or add suitable resources first. Then reassess the threshold; raising it must not conceal an environment without capacity.

## Monitoring Design

- Combine Prometheus, the Management Plugin, the HTTP API, CLI Observer, logs, and host metrics. A health check cannot replace trend monitoring.
- At minimum distinguish Cluster, Node, Queue, Connection, Channel, Publisher, Consumer, Stream, Alarm, and application-level metrics.
- Aggregated metrics suit high-frequency and large-scale collection. Per-object or Detailed metrics can produce high output volume and cardinality; limit their scope and frequency.
- Monitoring itself consumes CPU, memory, HTTP, Management Stats, and storage resources. Set collection frequency and object scope according to capacity and troubleshooting needs.
- Thresholds in Grafana or Prometheus charts are not universal RabbitMQ constants. Workload, Queue type, message size, and SLO affect a reasonable range.

## Capacity and Experiment Rules

Record the following for every performance experiment:

1. One primary variable, such as Prefetch, Consumer count, batch size, Connection distribution, or Queue type.
2. Fixed message size, Publish Rate, Consumer processing time, node resources, and test duration.
3. Success criteria, such as Confirm p95, Consumer p95, Queue Depth, CPU, RAM, disk latency, redelivery rate, and alarm count.
4. Failure criteria, rollback settings, data-cleanup method, and rerun steps.

Treat results as observations for the same topology and workload only. Do not present throughput, latency, or the best parameter from a single benchmark as a universal RabbitMQ capability.

### Sources

- [Production Deployment Guidelines](https://www.rabbitmq.com/docs/4.3/production-checklist)
- [Monitoring](https://www.rabbitmq.com/docs/4.3/monitoring)
- [Prometheus and Grafana](https://www.rabbitmq.com/docs/4.3/prometheus)
- [Reasoning About Memory Usage](https://www.rabbitmq.com/docs/4.3/memory-use)
- [Connections](https://www.rabbitmq.com/docs/4.3/connections)
- [Channels](https://www.rabbitmq.com/docs/4.3/channels)
- [Flow Control](https://www.rabbitmq.com/docs/4.3/flow-control)
- [Consumer Prefetch](https://www.rabbitmq.com/docs/4.3/consumer-prefetch)
- [Memory and Disk Alarms](https://www.rabbitmq.com/docs/4.3/alarms)
