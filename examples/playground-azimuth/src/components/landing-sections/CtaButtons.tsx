import type { FC } from 'react'
import React from 'react'

import { Action } from '../Action'
import type * as types from '.contentlayer/types'

export const CtaButtons: FC<{ actions: types.Action[] }> = ({ actions }) => (
  <>
    {actions.map((action, index) => (
      <Action key={index} action={action} />
    ))}
  </>
)
