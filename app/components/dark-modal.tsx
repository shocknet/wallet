import React from 'react'
import { Modal, View, StyleSheet, TouchableWithoutFeedback } from 'react-native'

import * as CSS from '../res/css'

interface Props {
  children: React.ReactNode
  onRequestClose?(): void
  visible: boolean
}

const DarkModal: React.FC<Props> = ({ children, onRequestClose, visible }) => (
  <Modal onRequestClose={onRequestClose} transparent visible={visible}>
    <TouchableWithoutFeedback onPress={onRequestClose}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback>
          <View style={styles.container}>{children}</View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
)

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: CSS.Colors.BACKDROP,
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: CSS.Colors.DARK_MODE_BACKGROUND_DARK,
    marginVertical: 100,
    marginHorizontal: 30,
    paddingHorizontal: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    marginBottom: 14,
    fontFamily: 'Montserrat-Regular',
  },
})

const MemoizedDarkModal = React.memo(DarkModal)

export default MemoizedDarkModal
