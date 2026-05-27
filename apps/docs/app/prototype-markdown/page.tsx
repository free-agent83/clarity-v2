"use client";

import { useEffect, useState } from "react";
import { AgentSpecActions } from "@/components/agent-spec-actions";

/** Stand-in for packages/components/.../field/COMPONENT.md */
const agentSpecMarkdown = `---
name: Field
slug: field
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "forms-field--default"
description: "Field composes label, control, description, and validation text."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use Field to standardize form semantics and spacing around inputs/selects/controls. Prefer Field when a control needs helper text, error text, or required/optional affordances.

## Best practices

- Keep one primary label per control.
- Use description for help text and error slot for actionable validation.
- Avoid custom spacing wrappers that break field rhythm across forms.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values`;

export default function MarkdownPrototypePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="docs-page-header flex flex-col gap-6 border-b border-fd-border pb-6">
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Prototype · component docs page
          </p>
          <h1 className="font-heading mb-0 text-[64px] font-normal leading-none">
            Field
          </h1>
          <p className="mb-0 max-w-2xl text-muted-foreground">
            Composes label, control, description, and validation into a single
            form field unit.
          </p>
        </div>

        {mounted ? <AgentSpecActions markdown={agentSpecMarkdown} /> : null}
      </header>

      <article className="prose max-w-none">
        <h2>When to use</h2>
        <p>
          Use Field whenever a form control needs a label, optional helper text,
          and a place for validation messages.
        </p>
        <h2>Composition</h2>
        <p>
          Field wraps native controls without replacing their behaviour.
          Consumers compose the control as a child.
        </p>
        <h2>Accessibility</h2>
        <p>
          Labels are associated with controls. Error text uses the correct ARIA
          relationships so screen readers announce validation state.
        </p>
      </article>
    </main>
  );
}
