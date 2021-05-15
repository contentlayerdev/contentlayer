import { action } from '.contentlayer'
import React, { FC } from 'react'
import { Action } from '../Action'

export const CtaButtons: FC<{ actions: action[] }> = ({ actions }) => (
  <>
    {actions.map((action, index) => (
      <Action key={index} action={action} />
    ))}
  </>
)
