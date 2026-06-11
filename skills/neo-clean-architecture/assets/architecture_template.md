# [System Name] — Clean Architecture Design Blueprint

This document specifies the architectural layout for [System Name], conforming to inward-only dependency rules of Clean Architecture.

---

## 1. Domain Layer

The Domain layer is independent of databases, web frameworks, and libraries.

### 1.1 Entities

#### Entity: `[EntityName]`
* **Description**: [E.g., Represents a registered user account]
* **Core Attributes** (Read-Only):
  - `id`: UniqueIdentifier
  - `[PropertyName]`: [PropertyType]
* **Invariants & Operations**:
  - `[MethodName]([parameters])`: [Explain what state changes are made and which invariants are verified]
  - `constructor([parameters])`: [Initial validation rules upon instantiation]

### 1.2 Value Objects

#### Value Object: `[ValueObjectName]`
* **Description**: [E.g., Format-validated email address]
* **Attributes**:
  - `value`: String
* **Validation & Formatting**:
  - [Explain formatting rules or auto-slug generation rules]

---

## 2. Application Layer

Defines use cases, structures input commands/queries, and declares repository interfaces.

### 2.1 Use Cases (CQRS)

#### Command / Query: `[OperationName]`
* **Description**: [E.g., Creating a new record]
* **Input Schema**:
  - `[ParamName]`: [ParamType]
* **Handler Execution Steps**:
  1. Trigger **Input Validator** to verify payload formatting.
  2. Call `[Repository].exists([uniqueKey])` to check for conflicts (return `Result.conflict` if true).
  3. Instantiate `[DomainEntity]`.
  4. Invoke `[Repository].add([EntityInstance])`.
  5. Return `Result.success([EntityId])`.

### 2.2 Repository Interfaces

#### Interface: `I[EntityName]Repository`
* `findById(id: UniqueIdentifier): Promise<[EntityName] | null>`
* `add(entity: [EntityName]): Promise<void>`
* `update(entity: [EntityName]): Promise<void>`
* `delete(id: UniqueIdentifier): Promise<void>`

---

## 3. Infrastructure Layer

Implements Application interfaces and coordinates technology-specific libraries.

### 3.1 Persistence

#### Class: `[EntityName]Repository`
* **Interface**: `I[EntityName]Repository`
* **Data Mapping**:
  - Map entity `[EntityName]` to table `[table_name]`.
  - Convert Value Object `[ValueObjectName]` to primitive database column type `[column_type]` on save, and deserialize on fetch.
* **Transaction Management**:
  - Save changes using the persistence tracker in the repository's persist methods.

### 3.2 External Gateways
* [E.g., File storage clients, mail gateways, third-party REST clients]

---

## 4. Presentation / API Layer

Entry point translating network protocols to Use Case payloads.

### 4.1 Endpoints & Routing

#### Route: `[HTTP_METHOD] /api/[resource_path]`
* **Description**: [E.g., Create a resource]
* **Request Contract**:
  - `[FieldName]`: [FieldType]
* **Response & Status Codes**:
  - `201 Created` / `200 OK` -> `[ResponseContract]`
  - `400 Bad Request` -> Validation Schema Errors
  - `409 Conflict` -> Business Rule Violations
  - `404 Not Found` -> Resource Missing
