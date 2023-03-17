import type { Thunk } from "@contentlayer/utils"
import type { QueryDatabaseParameters } from "@notionhq/client/build/src/api-endpoints"

export type DatabaseFieldTypeDefBase = {
    /**
     * When required, pages without this property defined will not be generated.
     */
    isRequired?: boolean,

    /**
     * Map this property to a specific key.
     * Defaults to the property name.
     */
    key?: string;

    /**
     * Field description used to generate comments.
     */
    description?: string;
} & ({ id: string } | { label: string })

export type DatabaseRelationFieldTypeDef = DatabaseFieldTypeDefBase & {
    type: 'relation',
    // TODO : Not used yet
    relation: DatabaseType,
    single?: boolean,
}

export type DatabaseRollupFieldTypeDef = DatabaseFieldTypeDefBase & {
    type: 'rollup',
    relation: DatabaseType,
}

export type DatabaseFieldTypeDef = DatabaseFieldTypeDefBase | DatabaseRollupFieldTypeDef | DatabaseRelationFieldTypeDef

export type DatabaseTypeDef<Flattened extends boolean = true, DefName extends string = string> = {
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

    fields?: Flattened extends false ? Record<string, DatabaseFieldTypeDef> | DatabaseFieldTypeDef[] : DatabaseFieldTypeDef[]
}

export type DatabaseType<DefName extends string = string> = {
    type: 'database',
    def: Thunk<DatabaseTypeDef<false, DefName>>
}

export type DatabaseTypes = DatabaseType<any>[] | Record<string, DatabaseType<any>>

export const defineDatabase = <DefName extends string>(
    def: Thunk<DatabaseTypeDef<false, DefName>>
): DatabaseType<DefName> => ({
    type: 'database',
    def,
})