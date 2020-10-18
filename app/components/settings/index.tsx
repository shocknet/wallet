import React from 'react'

import { StackNavigationOptions } from 'react-navigation-stack/lib/typescript/src/vendor/types'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as CSS from '../../res/css'

export const headerStyle: StackNavigationOptions['headerStyle'] = {
  backgroundColor: CSS.Colors.DARK_MODE_BACKGROUND_DARK,
  elevation: 0,
  shadowOpacity: 0,
  shadowOffset: {
    height: 0,
    width: 0,
  },
}

export const headerTitleStyle: StackNavigationOptions['headerTitleStyle'] = {
  fontFamily: 'Montserrat-700',
  color: 'white',
}

export const headerBackImage: StackNavigationOptions['headerBackImage'] = () => (
  <Ionicons
    name="ios-arrow-round-back"
    color={CSS.Colors.BORDER_WHITE}
    size={40}
  />
)

export * from './setting-or-data'
export * from './small-data'
