/* eslint-disable react-native/no-inline-styles */
import React from 'react'
import {
  StyleSheet,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import { Icon } from 'react-native-elements'

import * as CSS from '../../res/css'
import { bLogoSmall } from '../../res'

/**
 * @typedef {object} Props
 * @prop {() => void} onPressActionBtn
 * @prop {boolean} disableInput
 * @prop {(text: string) => void} onSend
 * @prop {(h: number) => void} onHeight
 */

/**
 * @typedef {object} State
 * @prop {string} text
 */

/**
 * @augments React.PureComponent<Props, State>
 */
export default class InputToolbar extends React.PureComponent {
  /** @type {State} */
  state = {
    text: '',
  }

  /** @type {React.RefObject<TextInput>} */
  textInputRef = React.createRef()

  /** @param {string} text */
  setText = text => this.setState({ text })

  focus = () => {
    const { current } = this.textInputRef
    current && current.focus()
  }

  /** @param {string} text */
  onInput = text => {
    this.setState({
      text,
    })
  }

  onPressSend = () => {
    this.setState({
      text: '',
    })
    this.props.onSend(this.state.text)
  }

  /**
   * @type {import('react-native').ViewProps['onLayout']}
   */
  onLayout = e => {
    this.props.onHeight(e.nativeEvent.layout.height)
  }

  render() {
    const { text } = this.state
    return (
      <TouchableWithoutFeedback>
        <View style={styles.container} onLayout={this.onLayout}>
          <View style={styles.oval}>
            <View style={styles.actionBtnWrapper}>
              <TouchableOpacity onPress={this.props.onPressActionBtn}>
                <Image source={bLogoSmall} style={styles.actionBtn} />
              </TouchableOpacity>
            </View>

            <TextInput
              editable={!this.props.disableInput}
              multiline
              onChangeText={this.onInput}
              style={styles.textInput}
              value={text}
              // @ts-expect-error
              paddingTop={0}
              paddingBottom={0}
              ref={this.textInputRef}
            />

            <Icon
              name="paper-plane"
              type="font-awesome"
              color={
                text.length > 0
                  ? CSS.Colors.TEXT_GRAY_LIGHT
                  : CSS.Colors.TEXT_WHITE
              }
              onPress={text.length > 0 ? this.onPressSend : undefined}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

export const CONTAINER_H_PAD = 6

export const OVAL_V_PAD = 12
const OVAL_HORIZONTAL_PADDING = 16
export const OVAL_ELEV = 5

export const ACTION_BTN_WIDTH = 24 * (97 / 128)
export const ACTION_BTN_HEIGHT = 24

const styles = StyleSheet.create({
  container: {
    width: CSS.WIDTH,
    paddingLeft: CONTAINER_H_PAD,
    paddingRight: CONTAINER_H_PAD,
    position: /** @type {'absolute'} */ ('absolute'),
    bottom: 0,
    // padding + TouchableWithoutFeedback instead of margin allows presses to
    // not pass through
    paddingBottom: 24,
  },

  oval: {
    elevation: OVAL_ELEV,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    borderRadius: 30,

    backgroundColor: CSS.Colors.BACKGROUND_WHITE,

    paddingTop: OVAL_V_PAD,
    paddingBottom: OVAL_V_PAD,

    paddingLeft: OVAL_HORIZONTAL_PADDING,
    paddingRight: OVAL_HORIZONTAL_PADDING,
  },

  actionBtnWrapper: {
    backgroundColor: 'white',
    borderRadius: ACTION_BTN_HEIGHT / 2,
    elevation: 4,
    height: ACTION_BTN_HEIGHT,
    width: ACTION_BTN_HEIGHT,
  },

  actionBtn: {
    height: ACTION_BTN_HEIGHT,
    width: ACTION_BTN_WIDTH,
  },

  textInput: {
    flex: 1,
  },
})
