import { T } from '@contentlayer/utils/effect'
import type { UserObjectResponse } from '@notionhq/client/build/src/api-endpoints'

import type { FieldFunctions } from '.'

export const fieldLastEditedBy: FieldFunctions<'last_edited_by'> = {
  getFieldDef: () =>
    T.succeed({
      type: 'nested',
      nestedTypeName: 'User',
    }),
  getFieldData: ({ propertyData }) => {
    const user = propertyData as UserObjectResponse
    return T.succeed({
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
    })
  },
}
