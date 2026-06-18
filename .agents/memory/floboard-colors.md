---
name: FloBoard colors convention
description: The colors.ts light key is the dark FloBoard theme; useColors always returns it
---

## Rule

`artifacts/floboard/constants/colors.ts` exports `{ light: {...dark tokens...}, radius }`. Despite being called "light", this key holds the **dark FloBoard palette** (void: #080B10, gain: #00E5A0, loss: #FF4D6A, etc.).

`hooks/useColors.ts` falls back to `colors.light` when no `dark` key exists — which means it always returns the FloBoard dark theme correctly.

**Why:** The Expo scaffold generated a `light`/`dark` structure, but FloBoard is dark-only so only `light` was populated with dark tokens.

**How to apply:** Never add a `dark` key to colors.ts or the hook will try to switch palettes. Keep all tokens in `colors.light`.
