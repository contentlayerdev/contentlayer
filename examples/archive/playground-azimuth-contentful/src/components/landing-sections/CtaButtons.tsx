import type { FC } from 'react'
import React from 'react'

import { Action } from '../Action'
import type { Action as Action_ } from 'contentlayer/generated'

export const CtaButtons: FC<{ actions: Action_[] }> = ({ actions }) => (
  <>
    {actions.map((action, index) => (
      <Action key={index} action={action} />
    ))}
  </>
)
