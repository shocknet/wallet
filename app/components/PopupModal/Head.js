import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Colors } from '../../res/css'
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5'

/**
 * @typedef {React.ReactChild | React.ReactFragment | React.ReactPortal | boolean | null | undefined} ReactNode
 */

/**
 * @typedef {object} Props
 * @prop {(object)=} style
 * @prop {ReactNode} children
 * @prop {(() => void)=} closeModal
 */

/**
 * @param {Props} props
 */
const Head = ({ style = {}, children, closeModal }) => {
  return (
    <View style={[styles.modalHead, style]}>
      {closeModal ? (
        <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModal}>
          <FontAwesome5Icon name="times" color="white" size={16} />
        </TouchableOpacity>
      ) : null}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  modalHead: {
    paddingVertical: 12,
    width: '100%',
    height: 50,
    flexShrink: 0,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0',
  },
  modalCloseBtn: {
    position: 'absolute',
    right: -15,
    top: -15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BACKGROUND_RED,
    borderRadius: 100,
    width: 30,
    height: 30,
  },
})

export default Head
