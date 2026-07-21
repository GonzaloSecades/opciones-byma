---
applyTo: "apps/web/**/*.ts,apps/web/**/*.tsx,apps/web/**/*.css"
---

# Frontend review instructions

- Review as Next.js App Router, React 19, TypeScript, and Tailwind CSS code.
- Preserve Server Components by default. Require `"use client"` only when browser APIs, state, effects, or event handlers make it necessary, and prevent server-only modules, secrets, or privileged Supabase clients from entering client bundles.
- Keep financial calculations in `packages/core` and market-data normalization in `packages/data`; frontend code may format and present results but must not duplicate domain logic.
- Validate all data crossing URL, form, API, storage, or server/client boundaries. Do not trust query parameters, serialized positions, broker responses, or database payloads.
- Check async UI for explicit loading, empty, stale, partial, and error states. Prevent request races, state updates after unmount, duplicate submissions, and hydration mismatches.
- Check accessibility: semantic elements, labels, keyboard operation, visible focus, meaningful chart alternatives, sufficient contrast, and announcements for dynamic errors or results.
- Check responsive behavior at narrow mobile widths and with long Spanish labels, large Argentine peso values, and dense option-chain tables.
- Preserve Spanish user-facing copy and Argentine options vocabulary. Prefer clear explanations suitable for a beginner without weakening numerical precision.
- Review React rendering for unstable keys, accidental mutation, unnecessary effects, stale closures, and expensive calculations repeated on every render.
- Require tests for extracted UI logic and critical interactions when the repository has an applicable test harness. At minimum, require deterministic package tests for any financial behavior the UI consumes.
