# Trial evidence

Why each rule in the playbook and agent contracts exists. `compile` doesn't read this file, so none of it reaches the `/pipeline` prompt or the agents. Each entry names the file and an anchor phrase from its rule; `npm test` checks that every anchor still appears in its file.

## How a rule gets in

- Each `/pipeline` run ends with "the one thing the pipeline got wrong". A miss seen once is recorded here under **Watching**. It becomes a rule when it happens a second time, or at once if it was severe (it shipped a defect, or only 3b caught it).
- Prefer folding a new case into an existing rule, especially hard rules 6 and 7, over adding a sentence.
- `pipeline.md` has a word cap, enforced by `npm test`. A rule that adds words has to merge or cut something else.
- A trial that only confirms a rule adds a line to its entry here, never to the playbook.

Trials are framesmith PRs (vicmaster/framesmith#N) unless named otherwise.

## Hard rules

### Report-only repo agents
Rule: `playbook/pipeline.md` · "runs as a report-only verifier on the pinned snapshot"
- #235: a docs steward run report-only by hand found eight over-claims for 66k, with little overlap with the cold-reader.
- #236 to #240: the steward ran report-only each time; #240 confirmed the tree unchanged after it returned.

### List the inputs (hard rule 6)
Rule: `playbook/pipeline.md` · "List the inputs before you cover them"
- #237: fix probes that skipped an axis missed two loosening fixes.
- #238: gate tests stressed one theme; a sweep over personalities × seeds found two stress failures.
- #239: a reload key built from the finding's inputs missed `safeArea`; only 3b caught it.
- #240: a round-1 fix got a one-axis probe instead of an input list; 3b found the case it missed.
- #251: a before/after render check left out the inputs the change touched and missed two regressions; a matrix from the full input list caught them.
- #253: stale-state inputs on the list went untested until mutation survivors showed them.

### A pass counts only if it could have failed (hard rule 7)
Rule: `playbook/pipeline.md` · "A pass counts only if it could have failed"
- Merged in 0.4.0 from seven rules that were each the same failure: a pass that would have passed anyway. The entries below are its cases.

### Twin tests
Rule: `playbook/pipeline.md` · "gets a twin in the same test that must fail"
- #246: a test asserted a control passed via one rule while the canvas padding passed it via another; only 3b caught it.
- #257: caught a test passing for the wrong reason.
- #258: the conformance verifier still listed five asserted passes without a failing twin.

### Red on the previous snapshot
Rule: `playbook/pipeline.md` · "copy the new test file into a `git archive` of that snapshot"
- #252: 14 fixes proved red this way; it caught a twin whose threshold was assumed at 2.97 and measured 3.03.
- #253: caught two half-vacuous fixtures that passed on the old code.

### Spec changes need a red test
Rule: `playbook/pipeline.md` · "every spec change made during build"
- #253: an approved mid-run spec change reached the snapshot with no test; all three of its wiring mutants survived.
- #257: held; a seeding change landed with a test red before it.

### Run a new kill against its mutant
Rule: `playbook/pipeline.md` · "run against that mutant before it's committed"
- #258: a survivor added in the fix round proved equivalent only when the orchestrator ran it.

### Probe every fix
Rule: `playbook/pipeline.md` · "whatever its claimed severity"
- #236: two loosening fixes let through cases the old code caught; only 3b saw it.
- #237: probes ran but picked the wrong neighbours; 3b found two more fixes that went too far.
- #238: a seeding fix skipped as "not a gate" left a partial case only 3b caught.
- #247: an unprobed tightening fix raised false blocking warnings on a correct table; only 3b caught it.
- #253: a fix judged "message only" fed a severity downgrade; only 3b caught it.
- #257: a "cosmetic" fix in a shared helper stripped attribution from every other rule's findings; only 3b caught it, and it was reverted.

### Pass over empty data
Rule: `agents/verifier.md` · "A passing assertion over empty or undefined data is a finding"
- #246: a conformance "minor" over blank values led to the slice's worst bug.

### Sampled sizes and realism
Rule: `agents/verifier.md` · "A pass at a few sampled sizes doesn't clear an axis"
- #258: the pre-freeze verifier saw a count widen to a 12-character figure in a badge that can't truncate, sampled two widths, and cleared it. The gate attack found the width where it fails.

### Skip clauses
Rule: `playbook/pipeline.md` · "is a verdict too"
- #252: the pre-freeze verifier passed a "skip silently" clause because the renderer draws nothing there; a misspelt token then gave an invisible checkbox with no finding.

## Phase 0

### Pre-freeze verifier
Rule: `playbook/pipeline.md` · "send one `verifier` to break it on paper"
- #233 (Phase 30 spec): 22 findings, about ten real wrong verdicts, before any build.
- #252, #253, #257, #258: 12, 13, 14 and 9 findings. In #252, one would have failed the gate on every dark generated system.

### Gate input set
Rule: `playbook/pipeline.md` · "pin the gate's input set"
- #238: see hard rule 6.

### Fixture check
Rule: `playbook/pipeline.md` · "open the fixture and confirm the elements it names exist"
- #247: an acceptance named a fixture's toolbar icons; the fixture had none, and the spec could only fail until a mid-build spec change.

### Render a mock
Rule: `playbook/pipeline.md` · "render one mock of each pinned case"
- #251: a frozen disabled-state contract left a white label nearly invisible on a light page, seen in the first build render.
- #257: held; a mock showed a grey ink producing a maroon tint, fixed before build.

## Phase 1

### Scout foreign context only
Rule: `playbook/pipeline.md` · "Scout foreign context only"
- Early trials (0.1.0): in-repo scouts ran 3.3× budget and the builder re-read everything.

### Experiment instead of scouting
Rule: `playbook/pipeline.md` · "running the real tool path in a scratch copy"
- #253: one run before freezing settled three contract facts cheaply.

## Phase 3

### Every test tier first
Rule: `playbook/pipeline.md` · "every tier the repo's runner has"
- #245: a stale test that ran only in the browser tier reached the snapshot and cost findings in three verifiers.

### Test adequacy lane
Rule: `agents/verifier.md` · "Mutate each rule, threshold and branch"
- #247: about 35 untested behaviours past the twin rule.
- #252: 350 mutants, 176 survivors, about 80 new assertions.
- #253: the untested spec change and an untested branch were the survivors that mattered.

### Targeted kill sets
Rule: `agents/verifier.md` · "one or two test files that exercise its code"
- #257: a full 8-file kill set per mutant, including a slow gate, reached about 130 of 211 mutants in 34 minutes.

### Timeout kills are survivors
Rule: `agents/verifier.md` · "only by a timeout is a survivor"
- #258: a position guard "died" only because an unrelated e2e test hung for 170s.

### Gate attack
Rule: `agents/verifier.md` · "Find an input the docs allow that the gate doesn't cover"
- #252: four real holes after conformance passed every acceptance; its 65-seed sweep came back clean.

### Steward and cold-reader lanes
Rule: `playbook/pipeline.md` · "split the lanes"
- #235: the steward found eight over-claims the cold-reader didn't flag.
- #252: the steward found 0 stale claims; the cold-reader found 7 comprehension gaps.

### Cold-reader glossary
Rule: `playbook/pipeline.md` · "a glossary of the terms the excerpt uses but defines elsewhere"
- #258: half the cold-reader's "can't tell" items were defined elsewhere in the same doc.

### Expected run time
Rule: `playbook/pipeline.md` · "states the verifier's expected run time"
- #257: with no expected time, a mutation verifier was stopped at 34 minutes after a progress question, with about 80 mutants unrun.

### Embedded documents
Rule: `playbook/pipeline.md` · "a cold-reader's document travels embedded by default"
- lead-crm issue 28 (Codex): a path-based cold-reader brief wasted a round in a runtime whose delegates had no file access.

### Placeholders
Rule: `playbook/pipeline.md` · "unfilled template placeholders"
- #237: a cold-reader brief went out with a literal `<<<DOC>>>` and wasted a 74k run.

### Fresh scratch directories
Rule: `playbook/pipeline.md` · "into a fresh `mktemp -d`"
- #245: a tool's safety layer blocked an `rm -rf` over unguarded variables.

### Preflight in every copy
Rule: `playbook/pipeline.md` · "run the brief's test command in every copy"
- lead-crm PR 47 (Codex): a `git archive` copy in /tmp ran the system Ruby 2.6 and failed in Bundler before any test.
- #234: the preflight was skipped in two of three copies when the rule said "the copy".

### Machine load
Rule: `playbook/pipeline.md` · "wait until no verifier is running"
- #245: a runner-timeout test and a perf-scaling test failed under verifier load and passed standalone.
- #247: with no verifier running, a test hit the 180s timeout at load average 9 and took 13s alone.
- #252: two load flakes at load average 7 and 8; #258: one at 11. Each passed alone, and the recorded `uptime` made triage immediate.

### Verifiers run only their tests
Rule: `agents/verifier.md` · "Run only the tests your brief needs"
- #245: see machine load.

### Foreground only
Rule: `agents/verifier.md` · "Run every command in the foreground"
- #246: a verifier left watch loops sending notifications after its report.

## Phase 3b

### Second round on the fixes
Rule: `playbook/pipeline.md` · "run ONE narrow verifier"
- From the reeve trial (0.1.0). Since then it was the only round to catch a defect in #236, #237, #238, #239, #240, #246, #247, #251, #253 and #257.

### Readers in the 3b brief
Rule: `playbook/pipeline.md` · "every reader of each function the diff changes"
- #257: see "Probe every fix".

### One fix round after 3b
Rule: `playbook/pipeline.md` · "At most one more fix round follows 3b"
- #236: the run's post-3b fix round had no rule.
- #237: the rule held: one round, proved red/green, recorded as not re-verified.

### Documents as deliverables
Rule: `playbook/pipeline.md` · "read the document end to end yourself"
- #233 (Phase 30 spec): fix rounds ran 20 → 10 → 4 → 4 findings, and only the orchestrator's read caught a bug one fix introduced.

## Phase 4

### Comments in the final read
Rule: `playbook/pipeline.md` · "comments and doc strings included"
- #245: the read caught an orphaned doc comment and a wrong function description that no verifier flagged.

### Background run deadlines
Rule: `playbook/pipeline.md` · "deadline at about twice its expected time"
- #240: a full-suite run hung for about 25 minutes and the user noticed first.

## Budget

### Estimate at 3×
Rule: `playbook/pipeline.md` · "at 3× your first intuition"
- Early trials (0.1.0): sub-agent spend ran about 3× naive estimates.
- #252, #253, #257: the phase 0 spec verifier ran 1.35×, 1.45× and 2.4× its budget.

## Watching

### Hash rendered output for renderer fixes
Status: watching
- #258: hashing the rendered markup of five untouched variants against the base settled "no regression" in one command.

### Symlink dependencies into scratch copies
Status: watching
- #252: symlinking `node_modules` into each `git archive` copy made the preflight pass with no toolchain trouble.
