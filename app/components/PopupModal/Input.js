import React from 'react'
import { StyleSheet, TextInput } from 'react-native'
import { Colors } from '../../res/css'

/**
 * @typedef {object} Props
 * @prop {(object)=} style
 * @prop {string} placeholder
 * @prop {(string)=} value
 * @prop {(text: string) => void} onChange
 */

/**
 * @param {Props} Props
 */
const Input = ({ style = {}, placeholder = '', value, onChange }) => {
  return (
    <TextInput
      style={[styles.modalInput, style]}
      placeholder={placeholder}
      placeholderTextColor={Colors.TEXT_GRAY_LIGHTEST}
      value={value}
      onChangeText={onChange}
    />
  )
}

const styles = StyleSheet.create({
  modalInput: {
    backgroundColor: Colors.TRANSPARENT_INPUT,
    fontFamily: 'Montserrat-700',
    color: Colors.TEXT_GRAY,
    borderRadius: 100,
    width: '85%',
    height: 35,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 11,
  },
})

export default Input
