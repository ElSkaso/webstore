# Agent Guide & Workspace Structure

This document outlines the organization of documentation files in this workspace and defines specific interaction protocols (trigger words) for AI agents operating in this repository.

---

## 1. Workspace File Map

Below is the structure of the documentation and planning files in the project root:

```text
shop/
├── AGENTS.md            # This file. Explains workspace structure, files, and agent workflows.
├── next-steps.md        # The action checklist for running, testing, database integration, and deployment.
├── plan.md              # The master implementation roadmap, tech stack decisions, and progress tracking.
└── questionnaire.md     # E-commerce discovery questionnaire used to gather business & technical requirements.
```

---

## 2. Markdown File Directory

### 📄 [AGENTS.md](file:///Users/rene/Documents/Projekte/shop/AGENTS.md)
* **Purpose**: Serves as the system instructions and reference manual for any AI coding assistant entering this workspace. 
* **Role**: Ensures consistency in project management, folder structures, and interaction guidelines.

### 📄 [next-steps.md](file:///Users/rene/Documents/Projekte/shop/next-steps.md)
* **Purpose**: A concrete guide outlining immediate verification tests, live Firebase DB hookups, and deployment pipelines.
* **Role**: Helps both the user and future agents run, verify, customize, and deploy the validated e-commerce application.

### 📄 [questionnaire.md](file:///Users/rene/Documents/Projekte/shop/questionnaire.md)
* **Purpose**: A discovery questionnaire containing key business, customer experience, and technical questions.
* **Role**: Acts as the input source for the project plan. The user answers these questions to define the scope of the web shop.

### 📄 [plan.md](file:///Users/rene/Documents/Projekte/shop/plan.md)
* **Purpose**: The living project plan and technical roadmap.
* **Role**: Dynamically updated based on the answers in `questionnaire.md`. It outlines architecture decisions, implementation steps, styling systems, and milestone tracking.

---

## 3. Agent Workflows & Trigger Words

AI agents reading this repository must recognize and respond to the following trigger words/commands. When a user uses a trigger word, the agent should immediately execute the corresponding workflow.

### 📋 Discovery & Requirements Workflow

* **Trigger Words / Commands**: 
  * `/questionnaire`
  * `start discovery`
  * `run questionnaire`
  * `reset questionnaire`
* **Agent Action**:
  1. Read [questionnaire.md](file:///Users/rene/Documents/Projekte/shop/questionnaire.md) to check its contents.
  2. Ask the user if they would like to fill it out directly or answer the questions one-by-one/in groups inside the chat.
  3. Offer to write answers into the markdown file as the conversation progresses.

### 🛠️ Plan Generation & Update Workflow

* **Trigger Words / Commands**: 
  * `/plan`
  * `generate plan`
  * `build roadmap`
  * `update plan`
* **Agent Action**:
  1. Read [questionnaire.md](file:///Users/rene/Documents/Projekte/shop/questionnaire.md) and extract all answers provided by the user.
  2. If answers are missing or vague, prompt the user for clarification on those specific items.
  3. Once sufficient answers are gathered, replace the contents of [plan.md](file:///Users/rene/Documents/Projekte/shop/plan.md) with a comprehensive, highly-structured project plan.
  4. The generated plan must include:
     * **Executive Summary**: Core project description and goals.
     * **Architecture & Tech Stack**: Selected frameworks (e.g., Vite/Next.js), styling (e.g., custom CSS), database (e.g., Firebase/Mock), and payment systems.
     * **UI/UX Design System**: Color palette (harmonious HSL/RGB), typography, and animation tokens.
     * **Milestones & Implementation Steps**: Organized phases (Phase 1: Setup/Auth, Phase 2: Catalog/Cart, Phase 3: Checkout/Payments, Phase 4: Polish/Deployment).
     * **Verification Plan**: Step-by-step testing instructions.
