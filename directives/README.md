# Directives (Layer 1: Standard Operating Procedures)

This directory houses all SOPs (Standard Operating Procedures) in Markdown format.

## Directive Lifecycle
1. **Define Goals & Intent:** Clearly explain what needs to be achieved in natural language.
2. **Specify Inputs & Outputs:**
   - **Inputs:** Data sources, user files, parameters.
   - **Outputs:** Intermediate data in `.tmp/`, final deliverables (cloud sheets, slides, reports, etc.).
3. **Execution Mapping:** Specify which deterministic Python script(s) in `execution/` should be run and in what order.
4. **Edge Cases & Failure Recovery:** Document known constraints (rate limits, file formats, error codes).
5. **Continuous Improvement (Self-Annealing):** When an execution script or workflow is improved, update the corresponding directive document.

## Directory Structure
- `directives/template.md`: Boilerplate template for writing new SOP directives.
- `directives/<task_name>.md`: Specific task directives.
