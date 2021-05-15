import { promises as fs } from 'fs'
import * as path from 'path'

// TODO make `cwd` configurable
export const makeArtifactsDir = async (): Promise<string> => {
  const artifactsDirPath = path.join('node_modules', '.contentlayer')
  await fs.mkdir(artifactsDirPath, { recursive: true })

  return artifactsDirPath
}
