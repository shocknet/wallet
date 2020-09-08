import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Moment from 'moment'
import * as Common from 'shock-common'

import { styles } from '../../res/css'
import { ConnectedShockAvatar } from '../ShockAvatar'

interface Props {
  author: Common.Schema.User
  date: number
}

export default class UserInfo extends React.Component<Props> {
  shouldComponentUpdate() {
    return false
  }

  render() {
    const { author, date } = this.props
    return (
      <View style={style.userInfoContainer}>
        <ConnectedShockAvatar height={60} publicKey={author.publicKey} />
        <View style={style.userInfoTextContainer}>
          <Text style={style.authorDisplayNameStyle}>{author.displayName}</Text>
          <Text style={style.dateStyle}>{Moment(date).format('hh:mm')}</Text>
        </View>
      </View>
    )
  }
}

const style = StyleSheet.create({
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 10,
  },
  userInfoTextContainer: {
    width: '100%',
    justifyContent: 'space-between',
    padding: 5,
  },
  authorDisplayNameStyle: {
    ...styles.textBold,
    ...styles.fontMontserratBold,
    ...styles.fontSize20,
    color: '#F3EFEF',
  },
  dateStyle: {
    ...styles.fontMontserrat,
    ...styles.fontSize14,
    fontStyle: 'italic',
    color: '#F3EFEF',
  },
})
