import type { UserObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import type { FieldFunctions } from ".";

export const fieldPeople: FieldFunctions<'people'> = {
    getFieldDef: () => {
        return {
            type: 'list',
            of: {
                type: 'nested_unnamed',
                typeDef: {
                    _tag: 'NestedUnnamedTypeDef',
                    extensions: {},
                    fieldDefs: [
                        {
                            name: 'type',
                            type: 'enum',
                            options: ['person', 'bot'],
                            description: 'The user type',
                            isSystemField: false,
                            default: undefined,
                            isRequired: false,
                        },
                        {
                            name: 'name',
                            type: 'string',
                            description: 'The user name',
                            isSystemField: false,
                            default: undefined,
                            isRequired: false,
                        },
                        {
                            name: 'avatarUrl',
                            type: 'string',
                            description: 'The user avatar',
                            isSystemField: false,
                            default: undefined,
                            isRequired: false,
                        },
                        {
                            name: 'email',
                            type: 'string',
                            description: 'User email address, only if the user is a person and the integration has user capabilities to access email addresses.',
                            isSystemField: false,
                            default: undefined,
                            isRequired: false,
                        },
                        {
                            name: 'workspace',
                            type: 'string',
                            description: 'User workspace owner, only if the user is a bot',
                            isSystemField: false,
                            default: undefined,
                            isRequired: false,
                        },
                    ]
                }
            }
        }
    },
    getFieldData: ({ property }) => {
        return (property.people as UserObjectResponse[]).map((user) => ({
            type: user.type,
            name: user.name,
            avatarUrl: user.avatar_url,
            ...'person' in user ? {
                email: user.person.email
            } : {},
            ...'bot' in user ? {
                workspace: user.bot.workspace_name
            } : {}
        }))
    }
}