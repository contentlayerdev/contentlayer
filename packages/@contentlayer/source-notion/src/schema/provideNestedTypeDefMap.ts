import type * as core from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

export const provideNestedTypeDefMap = (): T.Effect<OT.HasTracer, unknown, core.NestedTypeDefMap> =>
  pipe(
    T.succeed({
      dateRange: {
        _tag: 'NestedTypeDef' as const,
        name: 'DateRange',
        description: 'Nested type definition for Notion date properties',
        fieldDefs: [
          {
            name: 'start',
            type: 'date' as const,
            description: undefined,
            isSystemField: false,
            default: undefined,
            isRequired: true,
          },
          {
            name: 'end',
            type: 'date' as const,
            description: undefined,
            isSystemField: false,
            default: undefined,
            isRequired: false,
          },
          {
            name: 'timezone',
            type: 'string' as const,
            description: undefined,
            isSystemField: false,
            default: undefined,
            isRequired: false,
          },
        ],
        extensions: {},
      },
      user: {
        _tag: 'NestedTypeDef' as const,
        name: 'User',
        description: 'Nested type definition for Notion people properties',
        fieldDefs: [
          {
            name: 'type',
            type: 'enum' as const,
            options: ['person', 'bot'],
            description: 'The user type',
            isSystemField: false,
            default: undefined,
            isRequired: false,
          },
          {
            name: 'name',
            type: 'string' as const,
            description: 'The user name',
            isSystemField: false,
            default: undefined,
            isRequired: false,
          },
          {
            name: 'avatarUrl',
            type: 'string' as const,
            description: 'The user avatar',
            isSystemField: false,
            default: undefined,
            isRequired: false,
          },
          {
            name: 'email',
            type: 'string' as const,
            description:
              'User email address, only if the user is a person and the integration has user capabilities to access email addresses.',
            isSystemField: false,
            default: undefined,
            isRequired: false,
          },
          {
            name: 'workspace',
            type: 'string' as const,
            description: 'User workspace owner, only if the user is a bot',
            isSystemField: false,
            default: undefined,
            isRequired: false,
          },
        ],
        extensions: {},
      },
    }),
    OT.withSpan('@contentlayer/source-notion/schema:provideNestedTypeDefMap'),
  )
