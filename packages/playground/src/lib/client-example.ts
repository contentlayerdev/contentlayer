// example usage script

import { cache } from './generated-cache'
import { getDocumentsOfType } from '@sourcebit/sdk'

const configs = getDocumentsOfType({ cache, type: 'Config' })

configs[0].
