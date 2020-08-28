import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

import * as CSS from '../res/css'

/**
 * @typedef {object} Props
 * @prop {boolean|null=} disabled
 * @prop {() => void} onPress
 * @prop {string} title
 */

const theme = 'dark'

export default /** @type {React.FC<Props>} */ (React.memo(
  ({ disabled, onPress, title }) => (
    <TouchableOpacity
      disabled={!!disabled}
      onPress={onPress}
      style={theme === 'dark' ? styles.btnDark : styles.btn}
    >
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  ),
))

const styles = StyleSheet.create({
  btn: {
    height: 64,
    backgroundColor: CSS.Colors.ORANGE,
    borderRadius: 100,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },

  btnDark: {
    height: 64,
    backgroundColor: '#4285B9',
    borderRadius: 13,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderColor: CSS.Colors.TEXT_WHITE,
    borderWidth: 1,
  },

  title: {
    fontSize: 18,
    letterSpacing: 1.19,
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
  },
})
