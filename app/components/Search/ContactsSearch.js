/**
 * @format
 */
import React, { PureComponent } from 'react'
import {
  // Clipboard,
  StyleSheet,
  View,
  TextInput,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Suggestion from './Suggestion'

import * as CSS from '../../res/css'

/**
 * @typedef {object} Props
 * @prop {string} value
 * @prop {(text: string) => void} onChange
 * @prop {(object)=} style
 * @prop {(object)=} inputStyle
 * @prop {(string)=} icon
 * @prop {(boolean)=} disabled
 * @prop {(boolean)=} multiline
 */

/**
 * @augments PureComponent<Props, {}, never>
 */
class ContactsSearch extends PureComponent {
  state = {
    focused: false,
  }

  setFocus = (focused = false) => () => {
    this.setState({
      focused,
    })
  }

  render() {
    const { focused } = this.state
    const { value, onChange, style, inputStyle, disabled } = this.props
    return (
      <View
        style={[
          styles.inputGroupContainer,
          style,
          disabled ? styles.disabledContainer : null,
        ]}
      >
        <View style={styles.inputGroup}>
          <View
            style={[
              styles.inputContainer,
              inputStyle,
              disabled ? styles.disabledInput : null,
              focused ? styles.focusedInput : null,
            ]}
          >
            <Ionicons name="md-search" color="#CBC5C5" size={16} />
            <TextInput
              style={styles.input}
              value={value}
              editable={!disabled}
              onChangeText={onChange}
              placeholder="Search contacts..."
              onFocus={this.setFocus(true)}
              onBlur={this.setFocus(false)}
            />
          </View>
          {focused ? (
            <View style={styles.inputSuggestions}>
              <Suggestion name="Test Contact" />
            </View>
          ) : null}
        </View>
      </View>
    )
  }
}

export default ContactsSearch

const styles = StyleSheet.create({
  inputGroupContainer: {
    width: '100%',
    height: 36,
    elevation: 5,
  },
  inputGroup: {
    width: '100%',
    elevation: 4,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 13,
    borderRadius: 100,
    backgroundColor: CSS.Colors.BACKGROUND_LIGHTEST_WHITE,
    overflow: 'hidden',
  },
  focusedInput: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  disabledInput: {
    elevation: 0,
  },
  input: {
    flex: 1,
    marginLeft: 5,
  },
  inputSuggestions: {
    position: 'absolute',
    backgroundColor: CSS.Colors.BACKGROUND_LIGHTEST_WHITE,
    top: 36,
    width: '100%',
    height: 150,
    borderRadius: 15,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
})
