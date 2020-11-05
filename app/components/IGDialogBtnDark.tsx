import React from 'react'

import { View, StyleSheet, TouchableHighlight } from 'react-native'
import { Text } from 'react-native-elements'

import * as CSS from '../res/css'

interface Props {
  disabled?: boolean
  onPress(): void
  title: string
}

/**
 * An instagram-dialog-style button.
 */
const _IGDialogBtnDark: React.FC<Props> = ({ disabled, onPress, title }) => (
  <TouchableHighlight onPress={disabled ? undefined : onPress}>
    <View style={[styles.sidePadded, styles.btn]}>
      <Text style={disabled ? styles.textDisabled : styles.text}>{title}</Text>
    </View>
  </TouchableHighlight>
)

const IGDialogBtnDark = React.memo(_IGDialogBtnDark)

const styles = StyleSheet.create({
  btn: {
    paddingBottom: 16,
    paddingTop: 16,
  },

  sidePadded: {
    paddingLeft: 10,
    paddingRight: 10,
  },

  text: {
    color: CSS.Colors.DARK_MODE_TEXT_NEAR_WHITE,
    fontFamily: 'Montserrat-Regular',
  },

  textDisabled: {
    color: CSS.Colors.DARK_MODE_TEXT_GRAY,
    fontFamily: 'Montserrat-Regular',
  },
})

export default IGDialogBtnDark
