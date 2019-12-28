import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'

/**
 * @typedef {object} Props
 */

export default /** @type {React.FC<Props>} */ (React.memo(({ children }) => (
  <View style={style}>{children}</View>
)))

const { style } = StyleSheet.create({
  style: {
    position: 'absolute',
    top: 0,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
