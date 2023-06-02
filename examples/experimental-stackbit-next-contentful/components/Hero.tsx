import Markdown from 'markdown-to-jsx'
import React from 'react'
import Image from 'next/image'
import { Button } from './Button.jsx'
import { hero } from 'contentlayer/generated'

const themeClassMap = {
  imgLeft: 'flex-row-reverse',
  imgRight: '',
}

export const Hero = (props: hero) => {
  return (
    <div className="px-12 py-24 bg-gray-100" data-sb-object-id={props._id}>
      <div className={`flex mx-auto max-w-6xl gap-12 ${themeClassMap[props.theme] ?? themeClassMap['imgRight']}`}>
        <div className="max-w-xl py-20 mx-auto lg:shrink-0">
          <h1 className="mb-6 text-5xl leading-tight" data-sb-field-path="heading">
            {props.heading}
          </h1>
          {props.body && (
            <Markdown options={{ forceBlock: true }} className="mb-6 text-lg" data-sb-field-path="body">
              {props.body.raw}
            </Markdown>
          )}
          {props.button && <Button {...props.button} />}
        </div>
        <div className="relative hidden w-full overflow-hidden rounded-md lg:block" data-sb-field-path="image">
          {props.image && <Image src={props.image.src} alt={props.image.alt} layout="fill" objectFit="contain" />}
        </div>
      </div>
    </div>
  )
}
