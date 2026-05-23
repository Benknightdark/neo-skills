# 5W1H & Gap Analysis Framework

This reference guide outlines the systematic methodology for translating chaotic, emotional, or unstructured user complaints and screenshots into clean, structured system specifications.

---

## 1. Context Restoration via 5W1H

When a user submits a raw request (e.g., "The green button is gone! System is broken!"), the AI must reconstruct the context by mapping the input to the 5W1H dimensions:

| Dimension | Description | How to Extract / Infer |
| :--- | :--- | :--- |
| **Who** | The user role or persona facing the issue. | Identify based on the target module, UI elements in screenshots, or context (e.g., financial reporting, general member, administrator). |
| **Where** | The specific module, screen, or functional path. | Infer from URL paths, headers in screenshots, page titles, or context keywords. |
| **When** | The occurrence timing or trigger event. | Identify when the action took place (e.g., during query, upon button click, right after software update). |
| **What** | The objective phenomena or issue. | Separate facts from emotions. What actually happened? (e.g., a component failed to render, API timed out, validation error triggered). |
| **Why** | The business impact or operational pain point. | Why is this critical? (e.g., blocks weekly report submission, prevents tax filing). |
| **How** | The action or steps taken leading to the state. | How did they reach this screen? What specific parameters did they input? |

---

## 2. Gap Analysis (Identifying Missing Information)

Unstructured complaints are often full of gaps. A skilled analyst must systematically detect what is missing before attempting to design a solution.

### Core Checklist for Detecting Gaps:
1.  **Environment Gaps**: Is the OS, browser, device type, or environment (production, staging, UAT) unknown?
2.  **Reproduction Gaps**: Are the exact steps leading to the error vague or unspecified?
3.  **Data Gaps**: Are there query inputs, parameters, or test accounts that were not disclosed?
4.  **Error Details Gaps**: Is there an error code, stack trace, or console log hidden or unprovided?
5.  **Scope Gaps**: Is it unclear if the issue affects a single user or all users? Has their permission group changed?

---

## 3. Formulating Tactful Open Questions

Once gaps are identified, they must be converted into clear, professional, and empathetic clarifying questions.

### Guidelines for Formulating Questions:
*   **Be Polite and Constructive**: Avoid technical jargon that might intimidate the user.
*   **Be Specific**: Instead of asking "What did you do?", ask "Could you please share the specific search filters or inputs you used right before the button disappeared?"
*   **One Step at a Time**: Group questions logically and list them clearly in a bulleted format. Keep the total number of questions between 2 and 10.
*   **Provide Context for the Question**: Explain *why* you are asking (e.g., "To help us check if this is related to account permission permissions, other than your account, are your colleagues able to see this button?").
