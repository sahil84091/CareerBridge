# Execution Layer (Layer 3: Deterministic Scripts)

This directory contains deterministic Python scripts responsible for executing the workflows requested by the Orchestration layer.

## Guidelines
1. **Deterministic & Isolated:** Scripts should accept explicit CLI arguments or environment variables and produce reliable, reproducible outputs.
2. **Intermediate Data:** Store intermediate data or cache in `.tmp/`.
3. **No Secrets Hardcoded:** Always read secrets and API keys from `.env` or system environment variables.
4. **Error Handling & Exit Codes:** Exit with non-zero status codes upon failure and print informative error traces to stderr so the orchestrator can diagnose and self-anneal.
5. **Self-Annealing Documentation:** If script interfaces or operational requirements change, reflect them in the corresponding directive in `directives/`.
