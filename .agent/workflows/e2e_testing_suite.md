---
description: Comprehensive Playwright E2E Testing Suite Generation and CI/CD Integration.
input_variables:
  - feature_name
  - base_url
  - git_branch_name
---

# 🚀 E2E Testing Suite Creation Workflow

This workflow orchestrates the Planner, Generator, and Healer Agents to fully automate the testing pipeline for a new feature, leveraging the Model Context Protocol (MCP) and Playwright/TypeScript.

## Step 1: Initialize Context and Dependencies

1.  **Validate Dependencies:** Run necessary checks to ensure Playwright and TypeScript are installed.
    * `run_command("npm install playwright typescript @types/node --save-dev")`
    * `run_command("npx playwright install")`

2.  **Ensure MCP is Active:** Confirm the Playwright MCP server is running to grant browser interaction tools to the Agents.
    * *Agent Note: The Playwright Agent (via MCP) is now active and has access to browser controls.*

## Step 2: Test Plan Generation (Planner Agent)

1.  **Dispatch Planner Agent:** Use the Planner Agent to generate a high-level test plan based on the new feature.
    * **Agent Mission:** "Generate a detailed and comprehensive **Test Plan** for the **$feature\_name** feature. The plan must include a minimum of five key End-to-End user scenarios, data setup considerations (using `$base_url` as the entry point), and a list of required assertions. Output the plan as an Artifact named `TestPlan_$feature_name.md`."

2.  **User Review:** **Request Review** of the generated `TestPlan_$feature_name.md` Artifact. *Approval is required before proceeding to code generation.*

## Step 3: Automated Test Case Generation (Generator Agent)

1.  **Dispatch Generator Agent:** Use the Generator Agent to write the automated code.
    * **Agent Mission:** "Based *EXACTLY* on the approved Test Plan Artifact, generate the Playwright/TypeScript automated test cases. Store the files in a new directory: `tests/$feature\_name`. **Strictly follow the project's existing coding standards** (e.g., use Page Object Model if available, use semantic locators like `getByRole`, and ensure TypeScript is correctly typed). Commit the resulting test files to a new feature branch: **$git\_branch\_name**."

2.  **Code Review:** **Request Review** of the code diff for the files created in `tests/$feature\_name`. *Approval is required before the next step.*

## Step 4: Self-Healing Logic Implementation (Healer Agent)

1.  **Dispatch Healer Agent for Refinement:** Enhance the generated tests for resilience.
    * **Agent Mission:** "Refactor the tests in `tests/$feature\_name` to embed **AI self-healing locators**. This self-healing must be implemented using the **Model Context Protocol (MCP)** integration to capture runtime failures, analyze the DOM, and apply the most stable locator fix. Record any changes as an audited **Self-Heal Artifact**. This step ensures future maintenance is automated."

## Step 5: CI/CD Pipeline Integration

1.  **Dispatch Configuration Agent:** Generate and integrate the CI/CD pipeline file.
    * **Agent Mission:** "Create or update the GitHub Actions YAML file (`.github/workflows/ci.yml`) to include a new job named `test_$feature\_name`. This job must check out the code, install dependencies, and run the Playwright tests for the `$feature\_name` suite across Chromium, Firefox, and WebKit, and always publish the complete Playwright HTML Report as a CI Artifact."

2.  **Finalize and Push:** Commit all final changes (tests and CI configuration) to the **$git\_branch\_name** branch.
    * `run_command("git add .")`
    * `run_command("git commit -m 'feat: Agent-generated E2E suite for $feature\_name'")`
    * `run_command("git push -u origin $git\_branch\_name")`

## Workflow Execution Instructions

To execute this workflow, go to the **Agent Manager View**, select this workflow file, and provide the required input parameters.

| Variable | Description | Example Input |
| :--- | :--- | :--- |
| `feature_name` | A short, descriptive name for the feature being tested. | `user_onboarding_v2` |
| `base_url` | The URL of the environment to test against. | `https://staging.app.com` |
| `git_branch_name`| The name of the new branch to create for the changes. | `feature/test-onboarding-suite` |

***

### How to Use This in Antigravity

1.  **Save the file:** Save the code block above as `.agent/workflows/e2e_testing_suite.md`.
2.  **Open Agent Manager:** Go to the Antigravity Agent Manager view.
3.  **Select Workflow:** Select the **E2E Testing Suite Creation Workflow**.
4.  **Input Variables:** Provide the three required variables (`feature_name`, `base_url`, `git_branch_name`).
5.  **Run:** Execute the workflow. The Agent will stop at the two **Request Review*
