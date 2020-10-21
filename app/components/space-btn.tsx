import React from 'react'
import { TouchableOpacity, StyleSheet, View, Text } from 'react-native'

import ShockIcon from '../assets/images/shockB.svg'
import * as CSS from '../res/css'

import Pad from './Pad'

interface Props {
  iconLeft?: 'bolt'
  onPress?(): void
  /**
   * Reduces vertical padding.
   */
  slim?: boolean
  title: string
}

const SpaceBtn: React.FC<Props> = ({ iconLeft, onPress, title }) => (
  <TouchableOpacity onPress={onPress}>
    <View style={styles.container}>
      {iconLeft === 'bolt' && (
        <>
          <ShockIcon width={20} height={20} />
          <Pad amount={8} insideRow />
        </>
      )}
      <Text style={styles.configButtonTextDark}>{title}</Text>
    </View>
  </TouchableOpacity>
)

const containerBase = {
  width: '100%',

  alignItems: 'center',
  justifyContent: 'center',

  borderRadius: 6,

  borderWidth: 1,
  borderColor: CSS.Colors.DARK_MODE_CYAN,

  flexDirection: 'row',
  paddingVertical: 12,
} as const

const styles = StyleSheet.create({
  container: {
    ...containerBase,
  },
  containerSlim: {
    paddingVertical: 6,
  },

  configButtonTextDark: {
    color: CSS.Colors.DARK_MODE_CYAN,
    fontFamily: 'Montserrat-Medium',
    fontSize: 14,
  },
})

const MemoizedSpaceBtn = React.memo(SpaceBtn)

export default MemoizedSpaceBtn
