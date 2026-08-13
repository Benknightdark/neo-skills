# RabbitMQ Development Design

Use this reference for protocol and message-design decisions based on RabbitMQ 4.3. The primary sources are amqp.md, protocols.md, exchanges.md, queues.md, consumers.md, publishers/index.md, confirms.md, reliability.md, ttl.md, quorum-queues/index.md, and streams.md.

## Design Order

Define business semantics before designing objects and settings:

1. Define whether messages may be lost, whether duplicates are allowed, ordering requirements, retry limits, expiration policy, and the destination for failed processing.
2. Select the protocol and Virtual Host, then confirm authentication, authorization, isolation, and network boundaries.
3. Design Exchanges, Bindings, Routing Keys, and handling for unroutable messages.
4. Choose a Queue, Quorum Queue, or Stream, then confirm durability, replication, retention, replay, and resource characteristics.
5. Design Publisher Confirms, Consumer Acknowledgements, Prefetch, retry, and cancellation behavior.
6. Define monitoring, alerts, failure recovery, and verification cases.

## Exchanges and Routing

- Publishers send messages to an Exchange. The Exchange routes them to Queues according to Bindings and Routing Keys.
- direct is suitable for exact-key routing, fanout broadcasts to bound Queues, and topic routes by pattern. Select the type based on message topology and maintenance cost.
- When unroutable messages matter, explicitly choose Publisher-side reporting, an Alternate Exchange, or another observable failure path. Do not interpret a Confirm as proof that a Consumer will process the message.
- Exchanges, Bindings, and Queues are scoped to a Virtual Host. For cross-team or multi-tenant environments, confirm naming, permissions, and isolation boundaries first.
- When using Exchange-to-Exchange Bindings or an Alternate Exchange, include the additional routing layer and loop risks in verification.

## Queue Declaration and Lifecycle

- A Queue's name, Durable, Exclusive, Auto-delete, and Arguments together determine lifecycle and resource semantics.
- Redeclaring an existing Queue with inconsistent properties causes a channel-level PRECONDITION_FAILED. Treat the declaration contract as a versioned interface in deployment tools and applications.
- Queue types, some Arguments, and other creation-time settings cannot be changed arbitrarily after creation. Prefer Policies for group settings that Policies can manage instead of scattering them across application declarations.
- RabbitMQ 4.3 has disabled the default declaration of non-Durable, non-Exclusive Classic Queues. For short-lived data, evaluate a Durable Queue with Queue TTL, an Exclusive Queue, or another suitable data structure rather than relying on deprecated behavior.
- An Exclusive Queue is tied to the Connection that declared it and is suitable for temporary state owned by one Client. It is commonly paired with a Broker-generated name to avoid fixed-name races during reconnects.
- A Durable Queue does not mean that every message survives a restart. Check message persistence at publish time together with Queue durability.

## Reliability Boundaries

- A Publisher Confirm reports whether the Broker accepted and processed a publish. A Consumer Acknowledgement reports whether the Consumer completed delivery processing. They address failures in different directions.
- When Broker-side data safety matters, use an appropriate Durable Queue, persistent messages, Publisher Confirms, and a recovery workflow. Explicitly handle Confirm latency, negative responses, and Connection loss.
- A Consumer should not acknowledge before processing is complete. A disconnect, Channel closure, or Negative Acknowledgement can requeue unacknowledged messages, so processing must tolerate duplicate delivery.
- Requeue is not an infinite retry strategy. Set observable retry limits, delayed retry, or a Dead Letter path for persistent failures to avoid a Requeue Loop.
- Confirm, Ack, routing success, persistence success, and business processing success are different events. Represent them separately in state machines and audit records.

## Queue, Quorum Queue, and Stream

- A general Queue uses Queue, Consumer, Ack, Prefetch, and TTL semantics. Confirm whether replication and cross-node fault tolerance are required.
- A Quorum Queue provides replication, data safety, and consistency. It requires Durable and introduces membership management, Leader election, Delivery Limit, resource use, and performance trade-offs. Select it only when those semantics are required.
- A Stream is an immutable append-only log with Offset, Retention, replay, and a different consumption model. It is not a renamed general Queue and has different connection and replication requirements.
- For global ordering, check whether a Stream fits. If using Queues, evaluate Single Active Consumer, a single Consumer, or partitioning, including the effect of requeue on ordering.
- Do not conclude that Quorum Queues are always safer or Streams are always faster without workload evidence. Test message size, rate, replication factor, disk, Consumer behavior, and target SLO.

## Publisher and Consumer Behavior

- Messaging protocols generally expect long-lived Connections. Do not create and close a Connection for every publish or consume operation; evaluate Connection pooling when necessary.
- Connections and Channels consume Client and Broker resources. Reuse long-lived resources, close objects that are truly no longer needed, and monitor Connection or Channel Churn.
- If Publishers and Consumers share a Connection, Publisher Flow Control can affect Consumer manual acknowledgements. Separate the two Connection types when the requirements allow it.
- Prefetch controls the number of deliveries that have not completed. It affects throughput, latency, ordering, memory, and redelivery cost; adjust it only after measuring processing time, message size, Consumer count, and Ack behavior.
- Observe Consumer Capacity, unacknowledged message count, Queue Depth, Publish Rate, Deliver Rate, Ack Rate, and Confirm Latency together. Do not rely on Queue length alone.
- Polling Consumers add requests and latency without keeping delivery continuous. Unless single-message pulls are explicitly required, prefer continuous consumption.

## Language-Neutral Output

For development questions, use topology, protocol fields, configuration semantics, failure states, and verification cases. Do not produce Java, Python, C#, Go, Ruby, or other language-specific Client calls. If the user needs an implementation in a language, direct them to the corresponding official Client Library documentation.

### Sources

- [Exchanges](https://www.rabbitmq.com/docs/4.3/exchanges)
- [Queues](https://www.rabbitmq.com/docs/4.3/queues)
- [Consumers](https://www.rabbitmq.com/docs/4.3/consumers)
- [Publishers](https://www.rabbitmq.com/docs/4.3/publishers)
- [Consumer Acknowledgements and Publisher Confirms](https://www.rabbitmq.com/docs/4.3/confirms)
- [Reliability Guide](https://www.rabbitmq.com/docs/4.3/reliability)
- [Quorum Queues](https://www.rabbitmq.com/docs/4.3/quorum-queues)
- [Streams and Super Streams](https://www.rabbitmq.com/docs/4.3/streams)
