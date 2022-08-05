# For maintainers

- There seems to be a problem with Vitest versions newer than `0.12.10` that make tests fail on Node 16. Thus we're pinning the Vitest version to `0.12.10` as well as setting `threads: false` if Node < 18 is used.
  - See https://github.com/vitest-dev/vitest/issues/1191#issuecomment-1192798501
  - The underlying problems seems to be a bug in Node 16 related to worker cleanup.
- Seems also like Vitest even with Node 18 doesn't seem to work on Windows with `threads: true`

**TODO: We should see whether upcoming Node versions (incl 16.x release) fix the problems above so we can upgrade to the latest Vitest version and use `threads: true` in all cases.**
