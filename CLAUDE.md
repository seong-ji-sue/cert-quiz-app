# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This repository is a **cert-quiz-app** — a certification quiz application. The workspace runs inside a Docker container (Ubuntu 22.04) with Node.js 20, Python 3, and SSH access.

## Environment

- The container exposes SSH on port 2222 (root password: `vibe`)
- Node.js 20 and Python 3/pip are available
- The workspace directory is `/workspace`, bind-mounted from the host

## Docker

```bash
# Build and start the container
docker compose up -d --build

# Stop the container
docker compose down
```

## Code Formatting

VSCode is configured to use Prettier for formatting on save. If Prettier is added as a dependency, run it with:

```bash
npx prettier --write .
```
