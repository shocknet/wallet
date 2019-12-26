/** @format  */
import React from 'react'

import {
  Modal,
  View,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
} from 'react-native'

import * as CSS from '../res/css'

/**
 * @typedef {object} Props
 * @prop {React.ReactNode} children
 * @prop {() => void} onRequestClose
 * @prop {string=} title (Optional)
 * @prop {boolean} visible
 */

/**
 * @type {React.FC<Props>}
 */
const _BasicDialog = ({ children, onRequestClose, title, visible }) => {
  return ((
    <Modal onRequestClose={onRequestClose} transparent visible={visible}>
      <TouchableWithoutFeedback onPress={onRequestClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              {typeof title === 'string' ? (
                <Text style={styles.title}>{title}</Text>
              ) : null}
              <View>{children}</View>
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

  container: {
    backgroundColor: CSS.Colors.BACKGROUND_WHITE,
    marginBottom: 100,
    marginLeft: 30,
    marginRight: 30,
    marginTop: 100,
    paddingBottom: 15,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 15,
  },

  title: {
    fontSize: 16,
    marginBottom: 14,
  },
})

const BasicDialog = React.memo(_BasicDialog)

export default BasicDialog
