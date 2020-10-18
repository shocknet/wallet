import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import * as CSS from '../../res/css'
import Pad from '../Pad'

import Icon, { IconName } from './icon'

export interface SettingOrDataProps {
  subtitle?: string
  title: string

  rightSide?: IconName | 'input'
}

class _SettingOrData extends React.PureComponent<SettingOrDataProps> {
  render() {
    const { subtitle, title, rightSide } = this.props

    return (
      <View style={styles.container}>
        <View style={styles.titleAndSubtitleContainer}>
          <Text style={styles.title}>{title}</Text>

          <Pad amount={8} />

          <Text style={subtitle ? styles.subtitle : styles.subtitleHidden}>
            {subtitle || 'Lorem ipsumDolor Lorem ipsumDolor'}
          </Text>
        </View>

        {rightSide &&
          (() => {
            if (rightSide === 'input') {
              return null
            }

            return <Icon name={rightSide} />
          })()}
      </View>
    )
  }
}

const subtitleBase = {
  color: CSS.Colors.DARK_MODE_TEXT_NEAR_WHITE,
  fontFamily: 'Montserrat-500',

  letterSpacing: 0.1,
  fontSize: 11,
  maxWidth: '90%',
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  titleAndSubtitleContainer: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    flexShrink: 1, // prevent text from pushing stuff out of the screen
  },

  title: {
    color: CSS.Colors.DARK_MODE_CYAN,
    fontFamily: 'Montserrat-700',
    fontSize: 16,
  },

  subtitle: subtitleBase,

  subtitleHidden: {
    ...subtitleBase,
    color: 'transparent',
  },
})

export const SettingOrData = React.memo(_SettingOrData)
