import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
// @ts-ignore
import Carousel from 'react-native-smart-carousel'
import * as Common from 'shock-common'

import * as CSS from '../../res/css'

//import UserInfo from './UserInfo'
import ShockWebView from '../ShockWebView'
import moment from 'moment'
//@ts-ignore
import GotoDetailIcon from '../../assets/images/feed/gotodetail.svg'
//@ts-ignore
import PinPostIcon from '../../assets/images/feed/pin.svg'
//@ts-ignore
import UnpinPostIcon from '../../assets/images/feed/unpin.svg'
import ShockAvatar from '../ShockAvatar'

interface Props {
  author: Common.Schema.User
  date: number
  paragraphs: { id: string; text: string }[]
  images: { id: string; data: string; width: number; height: number }[]
  videos: { id: string; data: string; width: number; height: number }[]
  parentScrollViewRef: ScrollView | undefined
}

export default class Post extends React.Component<Props> {
  shouldComponentUpdate() {
    return false
  }

  gotoPostDetail = (_item: any) => {}

  render() {
    const {
      author,

      date,
      paragraphs = [],
      images = [],
      videos = [],
      //parentScrollViewRef,
    } = this.props
    const saved = false
    /*const carouselWidth = Math.round(width) - 20
    const dataCarousel = images.map(image => ({
      id: image.id,
      imagePath: image.data,
    }))*/
    const currentTimestamp = Date.now() / 1000
    const duration = currentTimestamp - date
    const diffString = moment.duration(duration, 'seconds').humanize()
  
    return (
      <View style={styles.postContainer}>
        <View style={styles.postContainerTop}>
        <ShockAvatar
          height={44}
          image={author.avatar ? author.avatar : null}
          //onPress={this.onPressAvatar}
          lastSeenApp={Date.now()}
          avatarStyle={styles.avatarStyle}
          disableOnlineRing
        />
          <View style={styles.postItemTitle}>
            <Text style={styles.postItemTitleText}>{author.displayName}</Text>
            <Text style={styles.postItemTimestamp}>{diffString + ' ago'}</Text>
          </View>
          <View style={styles.postItemBookmark}>
            {saved ? (<UnpinPostIcon />) : (<PinPostIcon />)}
          </View>
        </View>
        {/*<View style={styles.postContainerBody}>
          <Text style={styles.postItemDescription}>{item.description}</Text>
          <ImageBackground
            source={item.image}
            resizeMode="cover"
            style={styles.postItemImage}
          >
            <View style={styles.postItemPrice}>
              <Text style={styles.postItemProductName}>{item.productName}</Text>
              <Text style={styles.postItemProductPrice}>
                {item.productPrice + ' ' + item.unit}
              </Text>
            </View>
          </ImageBackground>
        </View>*/}
        <View style={styles.postContainer}>
        {/*<UserInfo author={author} date={date} />*/}
        {paragraphs.map(paragraph => (
          <Text style={xStyles.paragraph} key={paragraph.id}>
            {paragraph.text}
          </Text>
        ))}
        {videos.length > 0 && (
          <ShockWebView
            type="video"
            width={videos[0].width}
            height={videos[0].height}
            magnet={videos[0].data}
          />
        )}
        {videos.length === 0 && images.length > 0 && (
          <ShockWebView
            type="image"
            width={images[0].width}
            height={images[0].height}
            magnet={images[0].data}
          />
        )}
      </View>
        <View style={styles.postContainerBottom}>
          <TouchableOpacity onPress={this.gotoPostDetail}>
            <GotoDetailIcon />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  postContainer: {
    width: '100%',
    backgroundColor: '#16191C',
  },
  paragraphBase: {
    margin: 10,
    color: '#F3EFEF',
  },
  postContainerTop: {
    width: '100%',
    flexDirection: 'row',
  },
  postItemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  postItemTitle: {
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 10,
  },
  postItemTitleText: {
    textAlign: 'left',
    fontFamily: 'Montserrat-700',
    fontSize: 15,
    color: '#F3EFEF',
  },
  postItemTimestamp: {
    color: '#F3EFEF',
    fontSize: 10,
    fontFamily: 'Montserrat-700',
    textAlign: 'left',
  },
  postItemBookmark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  postContainerBottom: {
    alignItems: 'flex-end',
  },
  avatarStyle: {
    borderWidth: 5,
    borderRadius: 100,
    borderColor: '#707070',
    marginRight:8,
  },
})

const xStyles = {
  paragraph: [
    styles.paragraphBase,
    CSS.styles.fontMontserrat,
    CSS.styles.fontSize14,
  ],
}
