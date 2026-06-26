# Placement Intelligence System

Placement Intelligence System is a student-focused company research and preparation platform. It helps students understand companies before applying by combining structured company intelligence, skill requirements, student-fit scoring, company comparison, skill-gap analysis, and an AI placement assistant.

The platform is designed for students who want to make better placement decisions instead of applying blindly. It allows them to explore company profiles, compare opportunities side by side, enter their current skill levels, identify preparation gaps, and ask placement-related questions using data from the configured Supabase database.

## Repository Structure

```text
Placement-Intelligence-System/
|-- Placement Intelligence system/
|   `-- Main Next.js application
|-- Pre-requisite/
|   `-- Supabase setup instructions, SQL scripts, and CSV data files
|-- Master Prompts/
|   `-- Master system design and UI design prompts
`-- README.md
```

## Important Setup Order

Before running the application, complete the Supabase database setup.

Open the `Pre-requisite` folder and follow the instructions provided there in order. The folders are numbered step by step and must be completed sequentially.

The setup includes creating the staging table, loading company CSV data, creating normalized tables, loading country and city master data, migrating data into the normalized schema, creating skills/proficiency tables, loading skill data, and generating the views required by the application.

If the Supabase setup is incomplete, the app may still start, but company search, company profiles, comparison, skill matching, and chatbot responses will not work correctly.

## Master Prompts

The `Master Prompts` folder contains the base prompts used to guide the development of the system.

These prompts should be treated as the foundation for rebuilding, extending, or modifying the project with an AI coding assistant such as Codex. They are not runtime files. They are planning and generation references that describe how the application should be structured, what features it should include, and how the interface should behave.

Use the master prompts after completing or understanding the Supabase setup, because the application design depends on the database structure, views, and data flow created in the `Pre-requisite` folder.

## How To Use The Master Prompts

1. Open the `Master Prompts` folder.

2. Read the system design prompt first.

   This prompt explains the main product idea, required modules, data flow, app behavior, and expected architecture. Use it to understand the overall system before making changes.

3. Use the system design prompt as the base instruction when asking an AI coding assistant to build or extend the application.

   The prompt should guide the assistant on the expected pages, backend connections, Supabase usage, feature logic, and student-focused workflows.

4. After the system design is understood, read the UI design prompt.

   This prompt should guide the visual direction of the app, including layout, user experience, page structure, styling expectations, and how the interface should feel for students.

5. Apply the UI design prompt after the core app structure is in place.

   The system design prompt is for functionality and architecture. The UI design prompt is for presentation, interaction flow, and visual refinement.

6. When using Codex or another AI assistant, provide the prompts in this order:

   ```text
   1. System design prompt
   2. UI design prompt
   3. Any additional customization instructions
   ```

7. After the base app is generated, review the implementation manually.

   Check that the app correctly connects to Supabase, uses the expected views, handles missing data gracefully, and does not expose private keys or service-role credentials.

8. Use the prompts again when adding major features.

   For example, if you want to improve the chatbot, redesign the dashboard, add analytics, or change the skill matching flow, reuse the relevant master prompt as context before asking for modifications.

## Application Features

- Company search and exploration
- Detailed company intelligence profiles
- Student-fit score display
- Company comparison dashboard
- Skill match tool
- Required skills visualization
- AI placement assistant powered by Ollama
- Supabase-backed company and skill data

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- Ollama

## Local Setup

Open the main application folder:

```bash
cd "Placement Intelligence system"
```

Install dependencies:

```bash
npm install
```

or:

```bash
pnpm install
```

## Environment Variables

Create a `.env.local` file inside the `Placement Intelligence system` folder.

Use `.env.example` as the template:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OLLAMA_URL=
OLLAMA_MODEL=
```

Fill these values using your own Supabase and local Ollama configuration.

Do not commit `.env.local`.

Do not use Supabase service role keys in this frontend application. Use only the public anon key required by the app.

## Supabase Requirements

The Supabase project must be prepared using the files in the `Pre-requisite` folder.

Make sure:

- The required tables are created
- CSV files are loaded into the correct tables
- SQL scripts are executed in order
- Database views are generated successfully
- The app environment variables point to the configured Supabase project

## Ollama Requirements

The AI assistant uses Ollama locally.

Install Ollama separately, start it on your machine, and pull the model you want to use.

Example:

```bash
ollama pull gemma3:4b
```

Set the model name in `.env.local`:

```env
OLLAMA_MODEL=gemma3:4b
```

## Run The App

Start the development server:

```bash
npm run dev
```

or:

```bash
pnpm dev
```

Then open the local development URL shown in the terminal.

## Build

```bash
npm run build
```

or:

```bash
pnpm build
```

## Windows Launcher

A `start-app.bat` file is included inside the main application folder. It can check Node.js/npm availability, check whether Ollama is reachable locally, install dependencies if needed, and start the development server.

## Security Notes

This repository intentionally does not include:

- `.env.local`
- Supabase keys
- Private URLs
- Service role keys
- Local build output
- `node_modules`

Use `.env.example` only as a template.
