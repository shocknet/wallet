/**
 * @format
 */
import React, { PureComponent } from 'react'
import {
  // Clipboard,
  StyleSheet,
  Text,
  View,
  TextInput,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'

import * as CSS from '../../../res/css'

/**
 * @typedef {object} Props
 * @prop {string} label
 * @prop {string} value
 * @prop {(text: string) => void} onChange
 * @prop {(object)=} style
 * @prop {(object)=} inputStyle
 * @prop {(string)=} icon
 * @prop {(boolean)=} disabled
 */

/**
 * @augments PureComponent<Props, {}, never>
 */
class InputGroup extends PureComponent {
  state = {}

  render() {
    const {
      label,
      value,
      onChange,
      style,
      inputStyle,
      icon,
      disabled,
    } = this.props
    return (
      <View
        style={[
          styles.inputGroup,
          style,
          disabled ? styles.disabledContainer : null,
        ]}
      >
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.inputContainer,
            inputStyle,
            disabled ? styles.disabledInput : null,
          ]}
        >
          {icon ? <Ionicons name={icon} color="#CBC5C5" size={22} /> : null}
          <TextInput
            style={styles.input}
            value={value}
            editable={disabled}
            onChangeText={onChange}
          />
        </View>
      </View>
    )
  }
}

export default InputGroup

const styles = StyleSheet.create({
  inputGroup: {
    width: '100%',
    marginBottom: 42,
  },
  label: {
    fontSize: 14,
    color: CSS.Colors.TEXT_GRAY_LIGHTER,
    fontFamily: 'Montserrat-600',
    marginBottom: 11,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 45,
    paddingHorizontal: 13,
    borderRadius: 100,
    backgroundColor: CSS.Colors.BACKGROUND_LIGHTEST_WHITE,
    elevation: 4,
  },
  disabledInput: {
    elevation: 0,
  },
  input: {
    flex: 1,
  },
})
