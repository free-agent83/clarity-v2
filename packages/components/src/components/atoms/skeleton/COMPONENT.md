---
name: Skeleton
slug: skeleton
version: 0.1.0
status: stable
lastUpdated: 2026-04-14
story: "feedback-skeleton--default"
description: "Animated placeholder shown in place of content that is still loading."
---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | — | Additional classes. Set width, height, and border radius here to match the real content's shape. |

All standard HTML attributes for the root `<div>` are supported via prop spread.

## Usage guidelines

Use Skeleton to reserve layout space and signal that content is loading. Each Skeleton should roughly match the shape and size of the element it replaces so the UI doesn't jump when real content arrives.

**Don't use Skeleton** for long-running background work that isn't on the current screen — use a Progress component or toast instead. **Don't use Skeleton** when the load is so fast that the placeholder flashes and disappears — show no placeholder instead.

## Best practices

- **Do:** Compose multiple Skeletons together to mirror real layouts (e.g. avatar + two lines of text).
- **Do:** Match the border radius of the real element (`rounded-md` for buttons, `rounded-full` for avatars).
- **Do:** Use Skeletons in lists and grids — one per item — not a single large block covering the whole region.
- **Don't:** Animate Skeletons at different speeds on the same screen — they should feel uniform.
- **Don't:** Leave a Skeleton visible for more than a few seconds. If a load takes longer, switch to a Progress or a clear error state.

## Quality checklist

- [x] Accessibility: passes axe-core via @storybook/addon-a11y on all stories
- [x] Responsive: adapts to its container via width and height classes
- [x] Tokens only: no raw literals inside arbitrary value syntax