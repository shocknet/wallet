import React from 'react'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Fontisto from 'react-native-vector-icons/Fontisto'
import { ActivityIndicator } from 'react-native'

import * as CSS from '../../res/css'

export type IconName =
  | 'checkbox-active'
  | 'checkbox-passive'
  | 'spinner'
  | 'copy'
  | 'clock'
  | 'check'

interface Props {
  name: IconName
}

const _Icon: React.FC<Props> = ({ name }) => {
  if (name === 'checkbox-active') {
    return (
      <Fontisto name="checkbox-active" color={CSS.Colors.ORANGE} size={24} />
    )
  }

  if (name === 'check') {
    return <Entypo name="check" color={CSS.Colors.DARK_MODE_CYAN} size={24} />
  }

  if (name === 'checkbox-passive') {
    return (
      <Fontisto name="checkbox-passive" color={CSS.Colors.ORANGE} size={24} />
    )
  }

  if (name === 'clock') {
    return (
      <MaterialCommunityIcons
        name="clock"
        color={CSS.Colors.ORANGE}
        size={28}
      />
    )
  }

  if (name === 'copy') {
    return (
      <Ionicons name="ios-copy" color={CSS.Colors.DARK_MODE_CYAN} size={24} />
    )
  }

  if (name === 'spinner') {
    return <ActivityIndicator size="small" color={CSS.Colors.DARK_MODE_CYAN} />
  }

  throw new Error(`<Settings.Icon />: wrong icon name supplied.`)
}

const Icon = React.memo(_Icon)

export default Icon
