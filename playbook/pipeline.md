---
name: pipeline
summary: Run the function-staged sub-agent pipeline on a task — spec frozen first, scouts fan out to read, a single builder writes, verifiers fan out to check, an integration pass closes. Tracks spend per phase.
---

You (this session) are the **orchestrator and the only builder**. Sub-agents read and verify; only you write. These rules are the system — when in doubt, the rule wins over speed.

## Hard rules

1. **One writer per file set.** Only this session edits files. A second writer is allowed only for a genuinely disjoint file set (no shared files, contracts already frozen), in its own workspace — and that buys wall-clock only, never quality.
2. **Scouts and verifiers never write.** If a sub-agent reports something fixable, the fix comes back here.
3. **Artifacts are the handoff.** Between phases — and across any repo/session boundary — what travels is a complete artifact (spec, brief, report, issue), never "the context so far". A brief must stand alone: objective, where to look, what's known/ruled out, output format.
4. **No phase is skipped**, Integrate least of all. A task too small for the pipeline is a task you do directly — say so and skip the whole ceremony, not individual phases.
5. **If the repo's conventions limit multi-agent cost**, the user's invocation of the pipeline is that approval for this run's fan-out: record that in the run's notes and proceed — don't re-ask, and don't treat the convention as overridden for anything else.

## Phases

**0 · Spec — freeze before anyone builds.**
Use the repo's spec framework if it has one (spec-kit's specify → clarify → plan flow, or equivalent); otherwise write a SPEC.md and freeze it. The spec must pin the *contracts*: public API, schema/data shapes, error behavior, what "done" verifies. Unknowns that block the spec go to scouts first. The frozen spec is the ground truth every later phase verifies against — changing it mid-build means stopping and re-freezing (a recorded spec change), not drifting.

**1 · Scout — read wide, bring back conclusions.**
Fan out `scout` agents in parallel, one per independent unknown. Scouts run whenever an unknown blocks the next phase — for spec-blocking unknowns that means *before* phase 0; the numbering orders artifacts, not the clock. **Scout foreign context only**: upstream docs, ecosystem/prior art, other repos, subsystems you won't touch. Do NOT scout the files you will edit — the builder must read those in-session anyway, so a scout summary of them is spend without savings (trial data: in-repo scouts ran 3.3× budget and the builder re-read everything). Fold conclusions into the plan; cite them, don't re-read.

**2 · Build — single-threaded, against the frozen spec.**
You build, in this session, with continuous context. Updating affected docs (README, CHANGELOG, upgrade notes) is part of each change's "done" — the writer of the code change is the writer of its doc change. Record decisions the spec didn't cover as you go; they feed the verify briefs.

**3 · Verify — fan out, falsifiable briefs only.**
Freeze a **verification snapshot** first: commit the built code (uncommitted work gets a committed snapshot in a separate workspace — the working tree stays the user's), and every brief names the repository, the full commit SHA, and a version or content hash for any spec or fixture outside that commit. Don't write to the snapshot while verifiers run.
Launch `verifier` agents in parallel, one per independent claim set: spec conformance (each acceptance criterion), test adequacy (do the tests fail without the change?), and a review pass on the diff. Launch a `cold-reader` on every doc a stranger must act on (upgrade notes especially), with tasks derived from the doc's claims. Briefs must be falsifiable — "review this" is not a brief; "verify these N claims against these files/commands" is.
Agents that run tests get isolated resources: an own database name/schema each, and scratch copies made with `git archive <pinned SHA>` so tracked dotfiles travel along — two agents sharing a test database waste both runs. (Archives carry no Git metadata; the SHA in the brief is what identifies them. An embedded cold-reader document is identified the same way: file plus source SHA.)
**Capability preflight**: before sending a brief, check the delegate's runtime can execute it — can it read the files you name, run the commands you cite? Where it can't, embed the material in the brief instead of referencing it; a cold-reader's document travels embedded by default (trial data: a path-based cold-reader brief wasted a round in a runtime whose delegates had no file access). A scratch copy sits outside the project directory, so version managers won't pick the project's toolchain there: name the runtime explicitly in the brief (trial data: a `git archive` copy in /tmp ran the system Ruby 2.6 and failed in Bundler before any test).
Then **re-verify before acting**: a CONFIRMED finding gets checked against source by you before it changes code; PLAUSIBLE findings are triaged, not auto-fixed.
**3b · Second round on the fixes.** After acting on the findings, run ONE narrow verifier with the confirmed findings plus the fix diff, before Integrate — the riskiest code in the task is usually in these fixes, and without this round nothing independent ever looks at it. Each fix is a new snapshot and makes earlier verdicts stale for the new code: the 3b brief names the previously verified SHA, the new SHA, and the diff between them. A fix-diff verdict doesn't refresh unrelated claims — re-verify what the change can reach, or repeat the claim set when that's unclear. A fix that can't be verified in this environment gets the falsification treatment instead: prove it red without the fix and green with it (a throwaway branch through CI counts, and gets deleted after).

**4 · Integrate — mandatory, always last.**
Full test suite, docs/spec reconciliation (does the spec still describe what shipped?), and a final diff read end-to-end in one sitting. Record the final verified revision with the results; any change after it — code, merge, spec or fixture — reopens Verify and Integrate before completion is reported. If parallel builders existed, this is where their work merges — conflicts resolved here, deliberately, never by whoever pushed last.

## Budget

Before phase 0, write a budget line per phase (rough token caps; scouts and verifiers per-agent counts — default ≤3 scouts, ≤4 verifiers). **Estimate fan-out phases at 3× your first intuition**: two trials show sub-agent spend running ~3× naive estimates, so a naive number guarantees a fake overrun. After each phase, record actual spend next to the estimate. Crossing 2× the task's total: stop, report where it went, and ask whether to continue — overruns are data, silent overruns are the failure mode.

## Closing report

End with: what shipped vs the spec, the final verified revision and any claim still stale or unverified, per-phase spend table (budgeted/actual), verifier findings by verdict (confirmed/refuted/plausible) and what each changed, what the integration pass caught, and the one thing the pipeline itself got wrong this run (for the next iteration of this playbook).
