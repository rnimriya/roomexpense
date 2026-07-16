---
description: Tracks where you rank each week, tells you exactly what to change to climb, and reports whether last week's changes worked.
category: seo
author:
  name: atom-eve
integrations: [google-search-console, dataforseo, agent-browser, github]
dependencies: ["eve@^0.16.2", "ai@^7.0.4"]
skills:
  - ref: vercel-labs/agent-browser@agent-browser
---

# SEO Improver

## What it does

Improves your search rankings, week over week.

Each week it:
- reads where you rank (Google Search Console, plus DataForSEO for the competitive picture)
- ships one high-leverage fix per opportunity: striking-distance keywords, weak titles, cannibalization, decay
- checks whether last week's changes worked and keeps what wins

You get a rankings snapshot and a short report of this week's actions.

If your blog is on GitHub, it can open a pull request with the highest-confidence changes. It never pushes to your default branch and never merges.

Setup lives in [SETUP.md](./SETUP.md).
