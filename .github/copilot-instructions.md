# Copilot Instructions

This repository uses the Jarvis AI Agent Team operating model by default.

For any user request, first consult:

- `docs/README.md`
- `templates/simple-start-request.md`
- `skills/agent-team-orchestration/SKILL.md`
- `agents/00-agent-management-index.md`

The user does not need to manually write a full Human Brief. If the user gives a short request, automatically draft the Human Brief, then proceed through Jarvis strategy, Friday task decomposition, execution, Risk Shield review, and completion reporting.

For every meaningful new work request, first choose a request slug and start the local Jarvis dashboard immediately:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/start-jarvis-request.ps1 -RequestId <request-slug> -Task "<request summary>"
```

Open the returned `url` in the active AI tool browser or preview surface, such as VS Code Simple Browser/Webview when available. Do not use the OS default browser as the primary path. If no AI browser is callable, keep the server running and report the URL.

Then create `work-requests/YYYY-MM-DD-request-slug/` before execution and store the Human Brief draft, references, deliverables, local run notes, and verification evidence there.

Always preserve the 4-stage architecture:

- SYS.01 Dream Team
- SYS.02 Virtual Office
- SYS.03 Agent Brain
- SYS.04 Human Conductor

Ask for confirmation only for blocking risks such as deletion, external release, public deployment, data transfer, secrets, payments, personal data, legal/security exposure, or major strategy changes.
