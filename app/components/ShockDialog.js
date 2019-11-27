/** @format  */
import React from 'react'

import { Modal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { Text } from 'react-native-elements'

import IGDialogBtn from './IGDialogBtn'

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
                  <Text>{message}</Text>
                </View>
              )}

              {choices.length > 0 && (
                <View style={styles.choices}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flex: 1,
    justifyContent: 'center',
  },

  choices: {
    marginTop: 15,
    marginBottom: 15,
  },

  container: {
    backgroundColor: 'white',
    marginBottom: 100,
    marginLeft: 30,
    marginRight: 30,
    marginTop: 100,
    paddingBottom: 15,
    paddingTop: 15,
  },

  sidePadded: {
    paddingLeft: 10,
    paddingRight: 10,
  },
})

const ShockDialog = React.memo(_ShockDialog)

export default ShockDialog
