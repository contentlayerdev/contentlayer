import type { Thunk } from "@contentlayer/utils"

export type DatabaseTypeDef<DefName extends string = string> = {
    name: DefName,
    description?: string,
    databaseId: string,
}

export type DatabaseType<DefName extends string = string> = {
    type: 'database',
    def: Thunk<DatabaseTypeDef<DefName>>
}

export type DatabaseTypes = DatabaseType<any>[] | Record<string, DatabaseType<any>>

export const defineDatabase = <DefName extends string>(
    def: Thunk<DatabaseTypeDef<DefName>>
): DatabaseType<DefName> => ({
    type: 'database',
    def,
})