/**
 * @prettier
 **/
import React from 'react'

import {
  Modal,
  SafeAreaView,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

/**
 * @typedef {object} Props
 * @prop {import('react').ReactNode=} children
 * @prop {(() => void)=} onDismiss Called once the modal gets dismissed.
 * @prop {(() => void)=} onRequestClose
 * @prop {boolean} visible
 */

/**
 * @type {React.FC<Props>}
 */
const ShockModal = ({ children, onDismiss, onRequestClose, visible }) => ((
  <Modal
    animationType="fade"
    onDismiss={onDismiss}
    onRequestClose={onRequestClose}
    transparent
    visible={visible}
  >
    <TouchableWithoutFeedback onPress={onRequestClose}>
      <SafeAreaView style={styles.modalHolder}>
        <TouchableWithoutFeedback>
          <View style={styles.modal}>{children}</View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  </Modal>
))

const styles = {
  modal: {
    backgroundColor: 'white',
    marginBottom: 80,
    marginLeft: 30,
    marginRight: 30,
    marginTop: 40,
    paddingLeft: 32,
    paddingRight: 32,
    paddingTop: 38,
    paddingBottom: 38,
    borderRadius: 48,
  },

  modalHolder: {
    backgroundColor: 'rgba(36, 36, 36, 0.84)',
    justifyContent: /** @type {'center'} */ ('center'),
    flex: 1,
  },
}

export default React.memo(ShockModal)
