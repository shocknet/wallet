import React from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as CSS from '../res/css'

/**
 * @typedef {import('react-native').TextInputProps} TextInputProps
 */

/**
 * @typedef {object} Props
 * @prop {TextInputProps['autoCapitalize']=} autoCapitalize
 * @prop {TextInputProps['autoCorrect']=} autoCorrect
 * @prop {(boolean|null)=} disable
 * @prop {TextInputProps['keyboardType']=} keyboardType
 * @prop {(string|boolean|null)=} label
 * @prop {TextInputProps['onChangeText']} onChangeText
 * @prop {TextInputProps['onSubmitEditing']=} onSubmitEditing
 * @prop {TextInputProps['placeholder']} placeholder
 * @prop {TextInputProps['returnKeyType']=} returnKeyType
 * @prop {TextInputProps['secureTextEntry']=} secureTextEntry
 * @prop {((() => void) | boolean | null)=} onPressQRBtn If provided, a QR Btn
 * will be shown inside the input.
 * @prop {TextInputProps['textContentType']=} textContentType
 * @prop {TextInputProps['value']} value
 */

export default React.forwardRef((
  /** @type {Props} */ {
    autoCapitalize,
    autoCorrect,
    disable,
    keyboardType,
    label,
    onChangeText,
    onPressQRBtn,
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
        keyboardType={keyboardType}
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

      {typeof onPressQRBtn === 'function' && (
        <TouchableOpacity style={styles.scanBtn} onPress={onPressQRBtn}>
          <Ionicons
            name="ios-barcode"
            style={CSS.styles.positionAbsolute}
            size={10}
            color="#808080"
          />
          <Ionicons
            name="md-qr-scanner"
            style={CSS.styles.positionAbsolute}
            size={20}
            color="#808080"
          />
        </TouchableOpacity>
      )}
    </View>
  </>
))

const styles = StyleSheet.create({
  scanBtn: {
    width: 35,
    height: 35,
    flexShrink: 0,
    backgroundColor: CSS.Colors.GRAY_D9,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

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
