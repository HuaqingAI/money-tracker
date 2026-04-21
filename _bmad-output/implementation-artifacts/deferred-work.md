## Deferred from: code review of story-0-4-dev-toolchain-and-quality-gates (2026-04-21)

- Expo mobile build on Windows fails during `expo export` because `react-native/sdks/hermesc/win64-bin/hermesc.exe` is missing (`ENOENT`). Treat as infrastructure/environment follow-up for Expo SDK 54 + React Native 0.81 + pnpm on Win64 rather than a code defect in Story 0.4.
