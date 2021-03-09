import { action } from '@sourcebit/types'
import React, { FC } from 'react'
import Action from '../Action'

const CtaButtons: FC<{ actions: action[] }> = ({ actions }) => (
  <>
    {actions.map((action, index) => (
      <Action key={index} action={action} />
    ))}
  </>
)

export default CtaButtons
