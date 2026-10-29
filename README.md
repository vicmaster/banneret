# banneret

**A portable sub-agent pipeline for AI coding tools.** One canonical set of agent contracts — scout, verifier, cold-reader — plus a function-staged pipeline playbook, compiled to whatever tool you work in. Claude Code and Codex today; the canonical format is the product, adapters are thin.

A banneret was a medieval knight who led a small company under his own banner. That's the shape of this kit: your session leads; a small, disciplined retinue reads and verifies for it.

## Why agents-by-function, not agents-by-role

The evidence on multi-agent coding is narrower than the hype: parallel writers diverge on implicit decisions ([Cognition](https://cognition.com/blog/multi-agents-working)), most failures come from under-specification and missing verification, not model capability ([MAST, Berkeley](https://arxiv.org/abs/2503.13657)), and fan-out pays on *reading* and *checking*, not on writing ([Anthropic](https://www.anthropic.com/engineering/multi-agent-research-system)). So this kit doesn't give you a PM-agent and a dev-agent. It gives you:

- **A frozen spec first.** Contracts pinned before anyone builds (use spec-kit if your repo has it).
- **Scouts** (read-only, cheap): fan out over *foreign* context — upstream docs, ecosystem, other repos — and return conclusions, never dumps. They don't scout the files the builder will edit anyway; trial data says that's spend without savings.
- **One builder: your main session**, single-threaded, full context. Sub-agents never write.
- **Verifiers** (fan-out, where the spend pays): falsifiable briefs in, `CONFIRMED / REFUTED / PLAUSIBLE-UNVERIFIED` verdicts out, with evidence, a "checked and not flagged" calibration section, and a falsification plan for anything unverifiable locally. Includes a **cold-reader** that tests docs by acting on them with no other context.
- **A mandatory integration pass**, and a per-phase budget with a hard stop line.

Verification is pinned: briefs and reports name the exact commit (plus hashes for inputs outside it), uncommitted work gets a committed snapshot first, and any later change makes earlier verdicts stale until re-verified. This is a contract the agents follow, not an automatic Git gate enforced by the compiler.

Every rule in the playbook traces to a real trial run (four so far), not to a diagram. The playbook's budget guidance includes the observed constants (fan-out phases run ~3× naive estimates).

## Install & use

```bash
npx banneret compile                 # emit for every supported tool, into ./
npx banneret compile --target claude # just .claude/agents/ + .claude/commands/pipeline.md
npx banneret compile --target codex  # just .codex/agents/*.toml + a managed AGENTS.md block
npx banneret list                    # what the kit ships
```

Compilation is idempotent: re-running replaces banneret-managed files and the `<!-- banneret:pipeline -->` block in `AGENTS.md`, and touches nothing else. Commit the emitted files — they're your repo's copy, yours to tune.

Then, in your tool:

- **Claude Code**: `/pipeline <task>` runs the playbook; `scout`, `verifier` and `cold-reader` are available as subagents (scouts on a cheap model by default).
- **Codex**: ask to run the pipeline on a task; the managed `AGENTS.md` block carries the playbook, and the agents live in `.codex/agents/` (scouts compiled with `sandbox_mode = "read-only"` — the read-only rule is enforced by the sandbox, not just prose). Codex spawns subagents only when asked, which is exactly how the playbook invokes them.

## The canonical format

Sources live in [`agents/`](agents/) and [`playbook/`](playbook/): markdown bodies (the contract: what the brief must contain, the rules, the report format) under a small tool-neutral frontmatter:

```yaml
---
name: scout
summary: <one line: when to use it>   # becomes each tool's description
tier: cheap | standard                # model hint (claude: haiku/sonnet; codex: inherits)
access: read | read+exec              # read → enforced read-only where the tool supports it
---
```

The contracts are defined by their **artifacts** — brief in, report out — never by a runtime. That's what makes them portable: a verifier is anything that takes a falsifiable brief and returns verdicts with evidence, whether it runs as a Claude subagent, a Codex agent, or a headless CLI call.

## Adding a target

One emitter function in [`src/compile.js`](src/compile.js) (`TARGETS`): map the frontmatter, wrap the body, decide where files land. If you'd rather centralize distribution across many tools, [Ruler](https://github.com/intellectronica/ruler) syncs generic agent definitions from one source tree — banneret's canonical files are compatible source material for that route; what this repo adds is the *content*: contracts and a playbook with trial evidence behind them.

## Development

```bash
npm test   # node --test
```

No dependencies. Node ≥ 20.

## Who built this

Built by [Victor Velázquez](https://victorvelazquez.dev) — COO at [MagmaLabs](https://www.magmalabs.io) and author of [*The Agentic Engineer*](https://leanpub.com/theagenticengineer). Sibling of [reeve](https://github.com/vicmaster/reeve), where this pipeline ran its first end-to-end trial.

## License

MIT — see [LICENSE](LICENSE).
