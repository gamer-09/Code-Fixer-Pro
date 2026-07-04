# FloBoard

FloBoard is a financial markets app with an AI advisor. This repo has two main pieces you need running together:

1. **The API server** — fetches market data and talks to the AI
2. **The FloBoard app** — the actual app you use (mobile/Expo)

Run every command below from the **root of the project** (the top-level `Code-Fixer-Pro` folder).

## 1. Install everything

```bash
pnpm install
```

This installs dependencies for every part of the project at once.

## 2. Start the API server

```bash
PORT=5000 GEMINI_API_KEY=your_key_here pnpm --filter @workspace/api-server run dev
```

- `PORT` — what port the server runs on (e.g. 5000)
- `GEMINI_API_KEY` — needed for the AI advisor chat to work

Leave this running in its own terminal.

## 3. Start the FloBoard app

Open a **new terminal**, stay in the same root folder, and run:

```bash
EXPO_PUBLIC_DOMAIN=localhost:5000 pnpm --filter @workspace/floboard run dev
```

- `EXPO_PUBLIC_DOMAIN` — tells the app where the API server is (match it to the `PORT` you used above)

This opens the Expo dev server. Scan the QR code with the **Expo Go** app on your phone, or press `a` / `i` to open it in an Android/iOS emulator.

## That's it

With both running:
- The API server handles data + AI requests in the background
- The FloBoard app is what you actually see and use

If something isn't loading in the app, check that the API server is running first and that `EXPO_PUBLIC_DOMAIN` matches its port.

---

### Requirements
- Node.js and [pnpm](https://pnpm.io) installed
- A Gemini API key (for the AI advisor) — get one at [aistudio.google.com](https://aistudio.google.com)
- Expo Go app on your phone (optional, for testing on a real device)
