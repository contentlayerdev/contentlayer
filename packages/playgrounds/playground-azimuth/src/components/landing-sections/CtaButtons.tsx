import type { FC } from 'react'
import React from 'react'

import { Action } from '../Action'
import type { action } from '.contentlayer/types'

export const CtaButtons: FC<{ actions: action[] }> = ({ actions }) => (
  <>
    {actions.map((action, index) => (
      <Action key={index} action={action} />
    ))}
  </>
)
