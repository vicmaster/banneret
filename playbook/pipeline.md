---
name: pipeline
summary: Run the function-staged sub-agent pipeline on a task — spec frozen first, scouts fan out to read, a single builder writes, verifiers fan out to check, an integration pass closes. Tracks spend per phase.
---

You (this session) are the **orchestrator and the only builder**. Sub-agents read and verify; only you write. These rules are the system: when in doubt, the rule wins over speed.

## Hard rules

1. **One writer per file set.** Only this session edits files. A second writer is allowed only for a genuinely disjoint file set (no shared files, contracts already frozen), in its own workspace, and that buys wall-clock only, never quality.
2. **Sub-agents never write**: scouts, verifiers, and any agent the repo's own conventions dispatch. A repo agent that edits by design (a docs updater, a fixer) runs as a report-only verifier on the pinned snapshot (phase 3): it returns exact current → proposed edits, and you confirm the tree is unchanged when it returns. If a sub-agent reports something fixable, the fix comes back here.
3. **Artifacts are the handoff.** Between phases, and across any repo/session boundary, what travels is a complete artifact (spec, brief, report, issue), never "the context so far". A brief must stand alone: objective, where to look, what's known/ruled out, output format.
4. **No phase is skipped**, Integrate least of all. A task too small for the pipeline is a task you do directly: say so and skip the whole ceremony, not individual phases.
5. **If the repo's conventions limit multi-agent cost**, the user's invocation of the pipeline is that approval for this run's fan-out: record that in the run's notes and proceed. Don't re-ask, and don't treat the convention as overridden for anything else.
6. **List the inputs before you cover them.** When correctness depends on covering a set of inputs (the axes a fix moves, the readers of a value it changes, the inputs a gate must cover, the inputs a cache or invalidation key depends on, the inputs a before/after check compares), list the full set before writing the code, for every fix as well as the build, and put the list in the verifier's brief to attack. Covering only the inputs a finding names is how cases slip.
7. **A pass counts only if it could have failed.** Before a passing result counts as evidence, show the failure it would have reported:
   - A test that asserts a pass gets a twin in the same test that must fail.
   - Every fix, and every spec change made during build, is treated alike: it lands with a test proved red on the code before it and green after. Against a committed snapshot, copy the new test file into a `git archive` of that snapshot and run it there. An assertion added to kill a mutation survivor is run against that mutant before it's committed.
   - Each of them also gets a probe before it's committed, whatever its claimed severity: for each reader and axis it touches (rule 6), the nearest inputs that should keep the old behaviour, red/green against the old code. For a tightening fix, those are the correct cases that must keep passing. No exemptions: every probe skipped so far hid the bug.
   - A pass over empty or undefined data, a mutant "killed" only by a timeout, and a snapshot cleared by its fast test tier alone are not passes.
   - A pass at a few sampled sizes doesn't clear an axis: search it for where it breaks. An output a user would see as wrong (a value many times its normal width, a count shown as a currency figure) is a failure on sight, whatever the rule says.
   - A skip, exemption or "not measured" clause in a pass/fail rule is a verdict too. Ask what the user sees in that case; the clause becomes either a deliberate false negative named in the docs or a case to measure.

## Phases

**0 · Spec — freeze before anyone builds.**
Use the repo's spec framework if it has one (spec-kit's specify → clarify → plan flow, or equivalent); otherwise write a SPEC.md and freeze it. The spec pins the *contracts*: public API, schema/data shapes, error behavior, what "done" verifies. Unknowns that block the spec go to scouts first. Before freezing:
- If the spec defines a pass/fail rule whose verdict depends on prior runs or state (a gate, a readiness or permission check), or a gate over generated output, send one `verifier` to break it on paper: find an input sequence that gets the wrong verdict, and for every skip, exemption or "not measured" clause, say what the user sees and whether silence is the right verdict. Pin the draft by content hash and budget that verifier under phase 0.
- For a gate over generated output, pin the gate's input set (rule 6: themes, personalities, seeds, lengths) from what the docs promise agents.
- For every acceptance that names a fixture, open the fixture and confirm the elements it names exist in the shape the rule expects.
- When the spec pins how output looks (colours, opacities, geometry, layout, copy), render one mock of each pinned case and look at it.

The frozen spec is the ground truth every later phase verifies against. Changing it mid-build means stopping and re-freezing (a recorded spec change, with its red test under rule 7 proved before the verify snapshot is frozen), not drifting.

**1 · Scout — read wide, bring back conclusions.**
Fan out `scout` agents in parallel, one per independent unknown, whenever an unknown blocks the next phase (for spec-blocking unknowns, *before* phase 0; the numbering orders artifacts, not the clock). **Scout foreign context only**: upstream docs, ecosystem/prior art, other repos, subsystems you won't touch. Never scout the files you will edit: you read those in-session anyway. An unknown about how an in-repo tool behaves is settled by running the real tool path in a scratch copy. Fold conclusions into the plan; cite them, don't re-read.

**2 · Build — single-threaded, against the frozen spec.**
You build, in this session, with continuous context, under rules 6 and 7. Updating affected docs (README, CHANGELOG, upgrade notes) is part of each change's "done": the writer of the code change writes its doc change. Record decisions the spec didn't cover as you go; they feed the verify briefs.

**3 · Verify — fan out, falsifiable briefs only.**
*Snapshot.* Commit the built code (uncommitted work gets a committed snapshot in a separate workspace; the working tree stays the user's). Every brief names the repository, the full commit SHA, and a version or content hash for any spec or fixture outside that commit. Before briefing anyone, run the full suite on the snapshot, every tier the repo's runner has, and triage any failure. Don't write to the snapshot while verifiers run.

*Lanes.* Launch `verifier` agents in parallel, one per independent claim set: spec conformance (each acceptance criterion), test adequacy (mutation testing and twins, as the verifier contract describes), and a review pass on the diff. When the deliverable includes a gate, one brief is "find an input the docs allow that the gate doesn't cover". Launch a `cold-reader` on every doc a stranger must act on (upgrade notes especially), with tasks derived from the doc's claims and a glossary of the terms the excerpt uses but defines elsewhere. Where a report-only docs agent (rule 2) overlaps the cold-reader, split the lanes: it checks the docs against the code, the cold-reader checks whether a newcomer can act on them.

*Briefs.* Falsifiable: "verify these N claims against these files/commands", never "review this". Each brief states the verifier's expected run time. At about twice that, check whether it is alive (its files, its processes), and stop it only when it is past that deadline and stalled; a question about progress gets that check, not a stop. **Capability preflight**: before sending, check the delegate's runtime can execute the brief (read the files you name, run the commands you cite) and embed whatever it can't reach; a cold-reader's document travels embedded by default. Search every brief for unfilled template placeholders.

*Resources.* Each agent that runs tests gets its own database name/schema and its own scratch copy: `git archive <pinned SHA>` (tracked dotfiles travel along) into a fresh `mktemp -d`, never an old directory cleared with `rm -rf`. Archives carry no Git metadata; the SHA in the brief identifies them, as file plus source SHA identifies an embedded document. Version managers won't pick the project's toolchain outside the project: create each copy before briefing, run the brief's test command in every copy, hand each delegate its copy's path, and name the runtime explicitly in the brief. Agents share the machine, and load fails timing-sensitive tests: a verifier runs only the tests its brief needs, your own full-suite runs wait until no verifier is running, record the load (`uptime`) with each run, and rerun a failing test alone before the failure counts.

*Acting on findings.* A CONFIRMED finding gets checked against source by you before it changes code; PLAUSIBLE findings are triaged, not auto-fixed. Every fix follows rules 6 and 7.

**3b · Second round on the fixes.** After acting on the findings, run ONE narrow verifier with the confirmed findings plus the fix diff, before Integrate: the riskiest code in the task is usually in these fixes. Each fix is a new snapshot that makes earlier verdicts stale for the new code: the 3b brief names the previously verified SHA, the new SHA, the diff between them, and every reader of each function the diff changes. A fix-diff verdict doesn't refresh unrelated claims; re-verify what the change can reach, or repeat the claim set when that's unclear. A fix that can't be verified in this environment is proved red without it and green with it elsewhere (a throwaway branch through CI counts, and gets deleted after). At most one more fix round follows 3b: prove it red on the previous snapshot and green on the new one, and record it in the closing report as not re-verified by an agent. When the deliverable is a document, a fix reaches every section that cross-references it: read the document end to end yourself before each verifier round, name the touched and cross-referencing sections in the brief, and record what's left after the last round in the closing report.

**4 · Integrate — mandatory, always last.**
Full test suite, docs/spec reconciliation (does the spec still describe what shipped?), and a final diff read end-to-end in one sitting, comments and doc strings included. Give every background test run a deadline at about twice its expected time and check it then. Record the final verified revision with the results; any change after it (code, merge, spec or fixture) reopens Verify and Integrate before completion is reported. If parallel builders existed, this is where their work merges: conflicts resolved here, deliberately, never by whoever pushed last.

## Budget

Before phase 0, write a budget line per phase (rough token caps; scouts and verifiers per-agent counts, default ≤3 scouts, ≤4 verifiers). **Estimate fan-out phases, the phase 0 spec verifier included, at 3× your first intuition**: a naive number guarantees a fake overrun. After each phase, record actual spend next to the estimate. Crossing 2× the task's total: stop, report where it went, and ask whether to continue. Overruns are data; silent overruns are the failure mode.

## Closing report

End with: what shipped vs the spec, the final verified revision and any claim still stale or unverified, per-phase spend table (budgeted/actual), verifier findings by verdict (confirmed/refuted/plausible) and what each changed, including any pre-freeze spec verifier, the number of verify rounds and findings per round, what any fix probe caught, what the integration pass caught, and the one thing the pipeline itself got wrong this run (for the next iteration of this playbook).
