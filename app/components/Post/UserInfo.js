import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Moment from 'moment'
import * as Common from 'shock-common'

import { styles } from '../../res/css'
import { ConnectedShockAvatar } from '../ShockAvatar'

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
  },
  dateStyle: {
    ...styles.fontMontserrat,
    ...styles.fontSize14,
    fontStyle: 'italic',
  },
})

/**
 * @typedef {object} Props
 * @prop {Common.Schema.User} author
 * @prop {number} date
 */

/**
 * @type {React.FC<Props>}
 */
const Post = ({ author, date }) => ((
  <View style={style.userInfoContainer}>
    <ConnectedShockAvatar height={60} publicKey={author.publicKey} />
    <View style={style.userInfoTextContainer}>
      <Text style={style.authorDisplayNameStyle}>{author.displayName}</Text>
      <Text style={style.dateStyle}>{Moment(date).format('hh:mm')}</Text>
    </View>
  </View>
))

export default Post
