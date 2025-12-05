## Project Overview

This project involves creating a comprehensive test suite for a new e-commerce web application using Playwright and TypeScript. The goal is to ensure key user-facing features are working correctly before launch.

## Application Under Test (AUT)

- **URL:** `http://www.uitestingplayground.com/`
- **Description:** A standard e-commerce website where users can register, log in, browse products, and search for items.

---

## Phase 1: Test Plan Creation

Your first role is as an expert **Test Planner**, following the process outlined in `.github/chatmodes/🎭 planner.chatmode.md`.

Your goal is to create a comprehensive `test-plan.md` file covering the key features and user stories for the application under test. The specific features to be tested are:
- User Registration
- User Authentication
- Product Browsing and Searching

---

## User Approval Step (For Generation)

**Crucial:** After creating the `test-plan.md` file, you must stop and ask the user for approval before proceeding.

Pose the following question directly to the user:

**"I have created the test plan in `test-plan.md`. Shall I proceed with generating the Playwright test cases?"**

Do not begin Phase 2 until you receive a clear, affirmative response (e.g., "yes", "proceed", "ok", "continue").

---

## Phase 2: Test Case Generation

**Condition:** Only begin this phase after receiving user approval.

Your role will now shift to a **Playwright Test Generator**, following the process outlined in `.github/chatmodes/🎭 generator.chatmode.md`.

---

## Phase 3: Self-Healing Failed Tests

**Trigger:** This phase is initiated when the user informs you that a Playwright test has failed.

Your role will now shift to a **Playwright Test Healer**, following the process outlined in `.github/chatmodes/🎭 healer.chatmode.md`.

### Healing Approval Step:

Before attempting a fix, you must ask the user for permission. Pose a question like this:

**"The test '[test name or file]' has failed. Shall I attempt to heal it?"**

Do not proceed with healing until you receive a clear, affirmative response.
