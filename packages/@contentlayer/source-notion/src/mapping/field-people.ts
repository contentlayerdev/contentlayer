import { T } from '@contentlayer/utils/effect'
import type { UserObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import type { FieldFunctions } from '.'

export const fieldPeople: FieldFunctions<'people'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'list',
      of: {
        type: 'nested',
        nestedTypeName: 'User',
      },
      default: [],
    }),
  getFieldData: ({ propertyData }) =>
    T.succeed(
      (propertyData as UserObjectResponse[]).map((user) => ({
        type: user.type,
        name: user.name,
        avatarUrl: user.avatar_url,
        ...('person' in user
          ? {
              email: user.person.email,
            }
          : {}),
        ...('bot' in user
          ? {
              workspace: user.bot.workspace_name,
            }
          : {}),
      })),
    ),
}
