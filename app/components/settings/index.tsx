import React from 'react'
import { ScrollView, ScrollViewProps, StyleSheet } from 'react-native'

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

export const ScrollViewContainer: React.FC<ScrollViewProps> = React.memo(
  props => (
    <ScrollView
      {...props}
      style={CSS.styles.flex}
      contentContainerStyle={styles.scrollViewContainer}
    />
  ),
)

const styles = StyleSheet.create({
  scrollViewContainer: {
    backgroundColor: CSS.Colors.DARK_MODE_BACKGROUND_DARK,
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 40,
  },
})

/**
 * TODO: Use `React.Children.map()`
 */
export const PAD_BETWEEN_ITEMS = 48

export * from './setting-or-data'
export * from './small-data'
