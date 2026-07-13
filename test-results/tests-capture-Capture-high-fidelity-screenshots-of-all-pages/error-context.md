# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/capture.spec.ts >> Capture high-fidelity screenshots of all pages
- Location: tests/capture.spec.ts:4:5

# Error details

```
Error: Channel closed
```

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://localhost:3000/login", waiting until "load"

```

```
Error: browserContext.close: Target page, context or browser has been closed
```