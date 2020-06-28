import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Moment from 'moment'

import { styles } from '../../res/css'
import ShockAvatar from '../ShockAvatar'

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
 * @prop {string} authorDisplayName
 * @prop {number} date
 */

/**
 * @type {React.FC<Props>}
 */
const Post = ({ authorDisplayName, date }) => ((
  <View style={style.userInfoContainer}>
    <ShockAvatar image={null} lastSeenApp={null} height={60} />
    <View style={style.userInfoTextContainer}>
      <Text style={style.authorDisplayNameStyle}>{authorDisplayName}</Text>
      <Text style={style.dateStyle}>
        {Moment(date)
          .subtract(10, 'hours')
          .startOf('hour')
          .fromNow()}{' '}
        ago
      </Text>
    </View>
  </View>
))

export default Post
