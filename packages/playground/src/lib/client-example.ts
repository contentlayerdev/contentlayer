// example usage script

import { getDocumentsOfType } from '@sourcebit/core'
import { cache } from './generated-cache'

const configs = getDocumentsOfType({ cache, type: 'Config' })

configs[0].
