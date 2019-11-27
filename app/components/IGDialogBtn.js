/** @format  */
import React from 'react'

import { View, StyleSheet, TouchableHighlight } from 'react-native'
import { Text } from 'react-native-elements'

/**
 * @typedef {object} Props
 * @prop {boolean=} disabled
 * @prop {() => void} onPress
 * @prop {string} title
 */

/**
 * An instagram-dialog-style button.
 * @type {React.FC<Props>}
 */
const _IGDialogBtn = ({ disabled, onPress, title }) => (
  <TouchableHighlight onPress={disabled ? undefined : onPress}>
    <View style={[styles.sidePadded, styles.btn]}>
      <Text style={disabled ? styles.textDisabled : undefined}>{title}</Text>
    </View>
  </TouchableHighlight>
)

const IGDialogBtn = React.memo(_IGDialogBtn)

const styles = StyleSheet.create({
  btn: {
    paddingBottom: 16,
    paddingTop: 16,
  },

  sidePadded: {
    paddingLeft: 10,
    paddingRight: 10,
  },

  textDisabled: {
    color: 'grey',
  },
})

export default IGDialogBtn
