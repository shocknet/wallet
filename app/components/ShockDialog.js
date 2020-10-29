/** @format  */
import React from 'react'

import { Modal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { Text } from 'react-native-elements'

import * as CSS from '../res/css'

import IGDialogBtn from './IGDialogBtnDark'

/**
 * @typedef {object} Props
 * @prop {(Record<string, () => void>|{})=} choiceToHandler
 * @prop {string|null=} message
 * @prop {() => void} onRequestClose
 * @prop {boolean} visible
 */

/**
 * @type {React.FC<Props>}
 */
const _ShockDialog = ({
  choiceToHandler,
  message,
  onRequestClose,
  visible,
}) => {
  /** @type {[string , () => void][]} */
  const choices = Object.entries(choiceToHandler || {})

  return ((
    <Modal onRequestClose={onRequestClose} transparent visible={visible}>
      <TouchableWithoutFeedback onPress={onRequestClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {!!message && (
                <View style={styles.sidePadded}>
                  <Text style={styles.text}>{message}</Text>
                </View>
              )}

              {choices.length > 0 && (
                <View style={styles.choice}>
                  {choices.map(([choice, handler]) => (
                    <IGDialogBtn
                      key={choice + handler.toString()}
                      onPress={handler}
                      title={choice}
                    />
                  ))}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  ))
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: CSS.Colors.BACKDROP,
    flex: 1,
    justifyContent: 'center',
  },

  choice: {
    marginTop: 15,
    marginBottom: 15,
  },

  container: {
    marginHorizontal: 30,
    marginVertical: 100,

    backgroundColor: CSS.Colors.DARK_MODE_BACKGROUND_DARK,

    borderColor: CSS.Colors.DARK_MODE_BORDER_GRAY,
    borderWidth: 1,

    paddingVertical: 16,
    paddingHorizontal: 24,
  },

  sidePadded: {
    paddingLeft: 10,
    paddingRight: 10,
  },

  text: {
    color: CSS.Colors.DARK_MODE_TEXT_NEAR_WHITE,
    fontFamily: 'Montserrat-Regular',
  },
})

const ShockDialog = React.memo(_ShockDialog)

export default ShockDialog
