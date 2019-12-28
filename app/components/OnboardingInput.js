import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import * as CSS from '../res/css'

/**
 * @typedef {import('react-native').TextInputProps} TextInputProps
 */

/**
 * @typedef {object} Props
 * @prop {TextInputProps['autoCapitalize']=} autoCapitalize
 * @prop {TextInputProps['autoCorrect']=} autoCorrect
 * @prop {(boolean|null)=} disable
 * @prop {(string|boolean|null)=} label
 * @prop {TextInputProps['onChangeText']} onChangeText
 * @prop {TextInputProps['onSubmitEditing']=} onSubmitEditing
 * @prop {TextInputProps['placeholder']} placeholder
 * @prop {TextInputProps['returnKeyType']=} returnKeyType
 * @prop {TextInputProps['secureTextEntry']=} secureTextEntry
 * @prop {TextInputProps['textContentType']=} textContentType
 * @prop {TextInputProps['value']} value
 */

export default React.forwardRef((
  /** @type {Props} */ {
    autoCapitalize,
    autoCorrect,
    disable,
    label,
    onChangeText,
    onSubmitEditing,
    placeholder,
    returnKeyType,
    secureTextEntry,
    textContentType,
    value,
  },
  /** @type {React.Ref<TextInput>} */
  ref,
) => (
  <>
    {label && <Text style={styles.textInputFieldLabel}>{label}</Text>}
    <View style={styles.textInputFieldContainer}>
      <TextInput
        editable={!disable}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        returnKeyType={returnKeyType}
        ref={ref}
        secureTextEntry={secureTextEntry}
        style={styles.textInputField}
        textContentType={textContentType}
        value={value}
      />
    </View>
  </>
))

const styles = StyleSheet.create({
  textInputField: {
    fontSize: 14,
    fontFamily: 'Montserrat-600',
    flex: 1,
  },

  textInputFieldContainer: {
    height: 64,
    backgroundColor: CSS.Colors.TEXT_WHITE,
    borderRadius: 100,
    elevation: 3,
    paddingLeft: 25,
    alignItems: 'center',
    flexDirection: 'row',
  },

  textInputFieldLabel: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    marginLeft: 24,
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-600',
  },
})
