import { Command, Option } from 'clipanion'
import * as t from 'typanion'

export abstract class BaseCommand extends Command {
  schemaPath = Option.String('-s,--schema', {
    required: true,
    description: 'Path to the schema',
    validator: t.isString(),
  })
}
