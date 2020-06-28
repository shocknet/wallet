import React from 'react'
import { View, Text, StyleSheet, Dimensions } from 'react-native'
// @ts-ignore
import Carousel from 'react-native-smart-carousel'

import UserInfo from './UserInfo'
import { Colors, styles } from '../../res/css'

const { width } = Dimensions.get('window')

const style = StyleSheet.create({
  postContainer: {
    width: '100%',
    backgroundColor: Colors.BACKGROUND_NEAR_WHITE,
  },
  paragraphStyle: {
    ...styles.fontMontserrat,
    ...styles.fontSize14,
    margin: 10,
  },
})

/**
 * @typedef {object} Props
 * @prop {string} authorPublicKey
 * @prop {string} authorDisplayName
 * @prop {number} date
 * @prop {string[]} paragraphs
 * @prop {string[]} images
 */

/**
 * @type {React.FC<Props>}
 */
const Post = ({
  authorDisplayName = 'Shock User',
  date,
  paragraphs = [],
  images = [],
}) => {
  const carouselWidth = Math.round(width) - 20
  const dataCarousel = images.map((image, i) => ({
    id: i,
    imagePath: `data:image/jpeg;base64,${image}`,
  }))

  return ((
    <View style={style.postContainer}>
      <UserInfo authorDisplayName={authorDisplayName} date={date} />
      {paragraphs.map(paragraph => (
        <Text style={style.paragraphStyle} key={paragraph}>
          {paragraph}
        </Text>
      ))}
      {dataCarousel.length > 0 && (
        <Carousel
          width={carouselWidth}
          data={dataCarousel}
          navigationType="dots"
          navigationColor={Colors.BUTTON_BLUE}
          navigation
        />
      )}
    </View>
  ))
}

export default Post
