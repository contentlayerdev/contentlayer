# For maintainers

- There seems to be a problem with Vitest versions newer than `0.12.10` that make tests fail on Node 16. Thus we're pinning the Vitest version to `0.12.10` as well as setting `threads: false` if Node < 18 is used.
  - See https://github.com/vitest-dev/vitest/issues/1191#issuecomment-1192798501
  - The underlying problems seems to be a bug in Node 16 related to worker cleanup.
- Seems also like Vitest even with Node 18 doesn't seem to work on Windows with `threads: true`
- Update: I've been running into further issues with `threads: true` and have now disabled it entirely
- Update (2022/9/5): It seems like even the latest Vitest addition of `VITEST_SEGFAULT_RETRY` still doesn't resolve failing tests on Windows with Node 14 (see this [action run](https://github.com/contentlayerdev/contentlayer/actions/runs/2993794700))

**TODO: We should see whether upcoming Node versions (incl 16.x release) fix the problems above so we can upgrade to the latest Vitest version and use `threads: true` in all cases.**
