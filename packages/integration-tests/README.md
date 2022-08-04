# For maintainers

- There seems to be a problem with Vitest versions newer than `0.12.10` that make tests fail on Node 16. Thus we're pinning the Vitest version to `0.12.10` as well as setting `threads: false` if Node < 18 is used.
  - See https://github.com/vitest-dev/vitest/issues/1191#issuecomment-1192798501
	- The underlying problems seems to be a bug in Node 16 related to worker cleanup.
