---
name: csharp-coding
description: Provides expert advice on C# code generation and refactoring, focusing on Interface generation and file structure management.
---

# C# Coding Skill Specification

## Perceive
1. **Code Structure Recognition**: Parse C# Class content, identify properties, methods, and access modifiers.
2. **Constraint Check**:
   - Identify members with the `virtual` keyword.
   - Identify non-`public` members.
3. **Environment Awareness**: When the user specifies a target file, read the file content to check for the existence of an Interface with the same name.

## Reason
1. **Interface Generation Logic**:
   - **Naming Convention**: The Interface name must be the Class name prefixed with `I`.
   - **Property Filtering**:
     - **Keep only** simple properties.
     - **Strictly prohibit** properties containing the `virtual` modifier.
     - **Getter Only**: All properties in the interface MUST only have a `get;` accessor. No `set;` or `init;` is allowed.
     - Include only `public` members.
   - **Formatting**: Ensure the generated Interface follows standard C# indentation and brace styles.
2. **Smart Overwrite Strategy**:
   - If the target file does not exist: Plan to create a new file with necessary namespaces.
   - If the target file exists but has no Interface with the same name: Plan to append the new Interface to the end of the file.
   - If the target file exists and already contains an Interface with the same name:
     - Use regular expressions or block matching to find the start and end positions of the Interface.
     - Plan to replace only that specific block, preserving other classes, interfaces, or using declarations in the file.

## Act
1. **Code Generation**: Output a C# Interface that complies with the Reason logic.
2. **User Confirmation**:
   - After generation, pause and ask the user: "In which file should this Interface be stored? (Please provide a relative path)".
3. **Execution Write**:
   - Based on the user's response, perform `read_file` (if the file exists) -> logical replacement -> `write_file`.
   - Inform the user of the result (created, appended, or overwritten).