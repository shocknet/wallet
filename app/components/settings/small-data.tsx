import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

import Pad from '../../components/Pad'

import Icon, { IconName } from './icon'

export interface SmallDataProps {
  title: string
  subtitle?: string
  icon?: IconName
}

const _SmallData: React.FC<SmallDataProps> = ({ title, subtitle, icon }) => {
  return (
    <View style={styles.feePreferenceOption}>
      <Text style={styles.feePreferenceOptionTitle}>{title}</Text>

      <Pad amount={8} />

      {subtitle && (
        <Text style={styles.feePreferenceOptionInfo}>{subtitle}</Text>
      )}
      {icon && <Icon name={icon} />}
    </View>
  )
}

const styles = StyleSheet.create({
  feePreferenceOption: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  feePreferenceOptionTitle: {
    color: '#4285B9',
    fontFamily: 'Montserrat-600',
    fontSize: 15,
    textAlign: 'center',
  },
  feePreferenceOptionInfo: {
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    color: 'white',
    textAlign: 'center',
    paddingTop: 5,
  },
})

/**
 * For use inside a row container
 */
export const SmallData = React.memo(_SmallData)
