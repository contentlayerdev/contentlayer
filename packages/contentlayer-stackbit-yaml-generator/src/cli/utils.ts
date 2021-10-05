import YAML from 'yaml'

export const toYamlString = (json: any): string => YAML.stringify(json)
