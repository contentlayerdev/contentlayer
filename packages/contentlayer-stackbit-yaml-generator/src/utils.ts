import * as YAML from 'yaml'

export const toYamlString = (json: any): string => YAML.stringify(json)
