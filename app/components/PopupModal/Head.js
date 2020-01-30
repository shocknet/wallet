import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Colors } from '../../res/css'

/**
 * @typedef {React.ReactChild | React.ReactFragment | React.ReactPortal | boolean | null | undefined} ReactNode
 */

/**
 * @typedef {object} Props
 * @prop {(object)=} style
 * @prop {ReactNode} children
 */

/**
 * @param {Props} props
 */
const Head = ({ style = {}, children }) => {
  return <View style={[styles.modalHead, style]}>{children}</View>
}

const styles = StyleSheet.create({
  modalHead: {
    paddingVertical: 20,
    width: '100%',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.FUN_BLUE,
  },
})

export default Head
