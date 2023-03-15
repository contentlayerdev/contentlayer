import type { Thunk } from "@contentlayer/utils"
import type { QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints"

export type DatabaseFieldTypeDef = {
    isRequired: boolean,
} & (
        { id: string } | { label: string }
    )

export type DatabaseTypeDef<DefName extends string = string> = {
    name: DefName,
    description?: string,
    databaseId: string,

    /**
     * By disabling automatic imports, properties must be defined in `fields` property to be present in generated content.
     * Useful when you have page properties containing sensitive data.
     */
    automaticImport?: boolean,

    /**
     * By disabling content import, the page content will not be fetched.
     * Useful when you only want to use page properties for this database.
     */
    importContent?: boolean,

    /**
     * Sort and filter pages queried from the database.
     * More information on the Notion API documentation https://developers.notion.com/reference/post-database-query-filter
     */
    query?: Omit<QueryDatabaseParameters, 'database_id' | 'filter_properties' | 'start_cursor' | 'page_size'>

    fields?: Record<string, DatabaseFieldTypeDef>
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