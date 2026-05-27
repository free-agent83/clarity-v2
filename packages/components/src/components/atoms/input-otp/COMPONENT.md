---
name: InputOTP
slug: input-otp
version: 0.0.0
status: unstable
lastUpdated: 2026-04-13
story: "forms-inputotp--default"
description: "InputOTP captures one-time passcodes in segmented input slots."
---

## Props

Refer to the TypeScript props in the source file and the linked Storybook story for the exact API surface. This page captures usage intent and implementation guardrails.

## Usage guidelines

Use InputOTP for fixed-length verification codes (SMS, email, authenticator). Use standard Input for variable-length secure text.

## Best practices

- Auto-advance focus per slot while supporting backspace correction.
- Keep code length explicit in helper text.
- Support paste of full code for fast completion.

## Quality checklist

- [ ] Accessibility: passes axe-core, keyboard navigable, screen reader tested
- [ ] Figma parity: matches DSW-Web-Components Figma source
- [ ] Responsive: works at all breakpoints
- [ ] Tokens only: no hardcoded visual values