0 - analyze the codebase and the bug report in the readme. create a claude.me with architectural analysis, a plan.md with root cause analysis and fix plan for the reported bug (and any closely related issues), and a backlog.md documenting any unrelated bugs your found -- to be addressed in separate prs.

1 - build a playwright "intro to taskmanager" walkthrough and run it in headed mode. launch the browser fullscreen to maximize real estate for the caption overlay. this is a narrated demo, not a test -- it should feel like a course module. structure it as:

-- title card -- display a clean cover slide ("intro to taskmanager") centered in the browser, hold for a few seconds, then transition to the app.
-- feature walkthrough -- walk through each feature (add a task, mark complete, delete, refresh) with caption overlays at the bottom explaining whats happening, like a product tour. 10-second pauses between steps.
-- the turn -- caption shifts tone -- "but what happens when a user works quickly?" then reproduce the race conition from the readme's bug report live captions explain what just went wrong and why it matters. 10-second pauses.

2 - implement a playwright test that validates the bugs from your plan.md. tests should ASSERT the buggy behavior exists (iethey pass against the broken code). display a caption overlay at the ottom of the browser describing each step and its rationale. add a 10-second pause after each step so the viewer can read the capion and follow along. run it in headed mode, fullscreen.

3 - go ahead and implement the fixes. the dev server hot-reloads, so i can see the before/after in the browser.

4 - update the playwright tests to ASSERT correct behavior (the fixes), then re-run to confirm all tests pass. keep the same caption overlay and 10-second pauses. run it in headed mode, fullscreen.

5 - go ahead and commit and push the changes