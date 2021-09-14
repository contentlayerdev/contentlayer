import { getConfig } from '@contentlayer/core'
import { OT, pipe, T } from '@contentlayer/utils/effect'

// import { fs } from '@contentlayer/utils/node'
import { BaseCommand } from './_BaseCommand'

export class PostInstallCommand extends BaseCommand {
  static paths = [['postinstall']]

  executeSafe = pipe(
    T.suspend(() => getConfig({ configPath: this.configPath, cwd: process.cwd() })),
    T.tap(() => T.log(`"contentlayer postinstall" command executed.`)),
    // T.chain(() => fs.writeFile('postinstall.txt', 'this is a test')),
    // TODO check if artifact dir exists, if not, create it with some helpful comments
    // Goal: avoid errors (type vs import?) when cloning a repo without `build` having run yet
    OT.withSpan('@contentlayer/cli/commands/PostInstallCommand:executeSafe', { attributes: { cwd: process.cwd() } }),
  )
}
