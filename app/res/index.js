import React from 'react'
import { StyleSheet, View } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as CSS from './css'

/** @type {number} */
// @ts-ignore
export const shockBG = require('../assets/images/shock-bg.png')

/** @type {number} */
// @ts-ignore
export const shockLogo = require('../assets/images/shocklogo.png')

/** @type {number} */
// @ts-ignore
export const shockBG2 = require('../assets/images/shock-bg-2.png')

const { style } = StyleSheet.create({
  style: {
    paddingLeft: 12,
  },
})

/**
 * @type {import('react-navigation').StackNavigatorConfig}
 */
export const stackNavConfigHeaderMixin = {
  headerLayoutPreset: 'center',

  navigationOptions: {
    headerStyle: {
      backgroundColor: CSS.Colors.BACKGROUND_BLUE,
      elevation: 0,
      shadowOpacity: 0,
      shadowOffset: {
        height: 0,
        width: 0,
      },
    },

    headerBackImage: ((
      <View style={style}>
        <Ionicons
          suppressHighlighting
          color="white"
          name="ios-arrow-round-back"
          size={48}
        />
      </View>
    )),

    headerTitleStyle: {
      // design has regular (400 weight) font but 600 looks more like the
      // rendered design
      fontFamily: 'Montserrat-700',
      fontSize: 15,
      // https://github.com/react-navigation/react-navigation/issues/542#issuecomment-283663786
      fontWeight: 'normal',
    },

    headerTintColor: CSS.Colors.BACKGROUND_WHITE,
  },
}
