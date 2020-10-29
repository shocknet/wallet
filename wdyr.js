import React from 'react'
import whyDidYouRender from '@welldone-software/why-did-you-render'

const ENABLE = false

if (__DEV__ && ENABLE) {
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  })
}
