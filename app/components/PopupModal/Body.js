import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Colors } from '../../res/css'

/**
 * @typedef {React.ReactChild | React.ReactFragment | React.ReactPortal | boolean | null | undefined} ReactNode
 */

/**
 * @typedef {object} Props
 * @prop {(object)=} style
 * @prop {ReactNode} children
 */

/**
 * @param {Props} props
 */
const Body = ({ style = {}, children }) => {
  return (
    <ScrollView
      style={[styles.modalBody, style]}
      contentContainerStyle={styles.modalBodyContainer}
    >
      <View style={styles.modalBodyContent}>{children}</View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  modalBody: {
    width: '100%',
    backgroundColor: Colors.BACKGROUND_LIGHTEST_WHITE,
  },
  modalBodyContainer: {
    alignItems: 'center',
  },
  modalBodyContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    paddingVertical: 7,
  },
})

export default Body
