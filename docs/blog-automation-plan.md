# Blog Automation Pipeline — Complete (2026-05-07)

**Status:** ✅ Deployed  
**Commit:** `4b727c9` + upcoming fixup

## What was implemented

### Astro 6 Content Collection
- `src/content.config.ts` — `glob()` loader for `src/content/blog/` directory
- Schema: title, excerpt, date, tags, draft, published
- 3 posts: `xavier2-memory-core.md` (published), `multi-agent-orchestration-gestalt.md` (draft), `offline-first-architecture.md` (draft)

### Individual Blog Route
- `src/pages/blog/[slug].astro` — renders each post with full prose styles
- `getStaticPaths()` generates pages from content collection
- Calls `render()` + `getCollection()` from `astro:content`

### BlogSection Update
- `src/components/BlogSection.svelte` — accepts `posts` prop from Astro page
- Reads from content collection at build time
- Links published posts to individual `/blog/{slug}` page
- Draft posts show with badge, no link

### GitHub Action
- `.github/workflows/blog-sync.yml` — triggers on Issue with `blog-post` label
- Auto-generates `src/content/blog/{slug}.md` from issue body
- Commits + pushes → triggers deploy

### Pages built (7 total)
- `/` (home with all sections + blog preview)
- `/blog` (full blog listing)
- `/blog/xavier2-memory-core` (individual post)
- `/blog/multi-agent-orchestration-gestalt` (individual post)
- `/blog/offline-first-architecture` (individual post)
- `/projects`
- `/contact`

## How to add a new blog post

### Method 1: Write a `.md` file
Create `src/content/blog/your-post.md` with frontmatter:
```md
---
title: 'Your Title'
excerpt: 'Brief description.'
date: '2026-05-07'
tags: ['Tag1', 'Tag2']
draft: false
published: true
---
Content here...
```
Commit → auto-deploys.

### Method 2: GitHub Issue
Create an Issue with:
1. Title as blog post title
2. Body as blog content
3. Label: `blog-post`
4. Additional labels become tags

GitHub Action auto-generates the `.md` file and deploys.
