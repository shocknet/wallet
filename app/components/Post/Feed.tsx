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
import * as MediaLib from '../../services/mediaLib'

interface MediaToDisplay { 
  id: string
  data: string
  width: number
  height: number
  isPreview:boolean
  isPrivate:boolean 
}

interface Props {
  author: Common.Schema.User
  date: number
  paragraphs: { id: string; text: string }[]
  images: MediaToDisplay[]
  videos: MediaToDisplay[]
  parentScrollViewRef: ScrollView | undefined
}

interface State {
  isPrivate:boolean
  isAvailable:boolean
  isReady:boolean
  imagesToDisplay:MediaToDisplay[]
  videosToDisplay:MediaToDisplay[]
  privateImages:MediaToDisplay[]
  privateVideos:MediaToDisplay[]
  
}
const DEFAULT_STATE:State = {
  isAvailable:false,
  isPrivate:false,
  isReady:false,
  imagesToDisplay:[],
  videosToDisplay:[],
  privateImages:[],
  privateVideos:[],
}

export default class Post extends React.Component<Props,State> {
  //shouldComponentUpdate() { 
    //return false why?
  //}

  gotoPostDetail = (_item: any) => {}

  state = DEFAULT_STATE


  async componentDidMount(){
    const {
      images = [],
      videos = [],
      //parentScrollViewRef,
    } = this.props
    /*const carouselWidth = Math.round(width) - 20
    const dataCarousel = images.map(image => ({
      id: image.id,
      imagePath: image.data,
    }))*/
    

    const imagePreviews:typeof images  = []
    const imageMedias:typeof images  = []
    const videoPreviews:typeof videos  = []
    const videoMedias:typeof videos  = []

    const privateVideos:typeof videos = []
    const privateImages:typeof images = []

    //fill an array with all the image media that isPreview and not
    images.forEach(e => {
      if(e.isPreview){
        imagePreviews.push(e)
      } else {
        imageMedias.push(e)
      }
    })
    //fill an array with all the videos media that isPreview and not
    videos.forEach(e=> {
      if(e.isPreview){
        videoPreviews.push(e)
      } else {
        videoMedias.push(e)
      }
    })
    if(imagePreviews.length === 0 && videoPreviews.length === 0){
      //this post has no preview, must be public, ribbon used for tip count
      this.setState({
        isReady:true,
        imagesToDisplay:imageMedias,
        videosToDisplay:videoMedias
      })
    } else {
      //this post has a preview, check if it has private media
      videoMedias.forEach(e => {
        if(e.isPrivate){
          privateVideos.push(e)
        }
      })
      imageMedias.forEach(e => {
        if(e.isPrivate){
          privateImages.push(e)
        }
      })
      if(privateImages.length === 0 && privateVideos.length === 0){
        //this post has a preview but no private media, ribbon used for tip count
        this.setState({
          //show media even if it has a preview, might edit later
          isReady:true,
          imagesToDisplay:imageMedias,
          videosToDisplay:videoMedias
        })
      } else {
        //this post has private media,check if the media is already paid
        const clearContent:boolean|{images:typeof images,videos:typeof videos} = await MediaLib.isContentAvailable(privateImages,privateVideos)
        if(clearContent === false) {
          //the content is not available display preview instead, ribbon is to pay
          this.setState({
            isReady:true,
            isPrivate:true,
            isAvailable:false,
            imagesToDisplay:imagePreviews,
            videosToDisplay:videoPreviews,
            privateImages:privateImages,
            privateVideos:privateVideos
          })
        } else {
          //the content is private and is available, ribbon not used 
          this.setState({
            isReady:true,
            isPrivate:true,
            isAvailable:true,
            imagesToDisplay:imageMedias,
            videosToDisplay:videoMedias
          })
        }
      }
    }
  }

  renderRibbon = ():JSX.Element|null => {
    const {
      isPrivate,
      isAvailable
    } = this.state
    if(!isPrivate){
      return <View style={{display:'flex',flexDirection:'row-reverse'}}>
        <View style={{backgroundColor:'#16191C',position:'relative',top:-120,width:100}} >
          <Text style={{color:'white'}}>Total Tips</Text>
          <Text style={{color:'white'}}>{'25000'/*TMP*/}sats</Text>
        </View>
      </View>
    }
    if(!isAvailable){
      return <View style={{display:'flex',flexDirection:'row-reverse'}}>
        <View style={{backgroundColor:'#16191C',position:'relative',top:-120,width:100}}>
          <TouchableOpacity onPress={this.handlePaywallClick}>
            <Text style={{color:'white'}}>Paywall</Text>
            <Text style={{color:'white'}}>{'250'/*TMP*/}sats</Text>
          </TouchableOpacity>
        </View>
      </View>
    }

    return null
  }

  handlePaywallClick = async () => {
    const {
      privateImages,
      privateVideos
    } = this.state
    this.setState({isReady:false})
    const unlockedMedia = await MediaLib.getPrivateContent(privateImages,privateVideos)
    this.setState({
      isReady:true,
      imagesToDisplay:unlockedMedia.images,
      videosToDisplay:unlockedMedia.videos,
      isPrivate:true,
      isAvailable:true,
    })
  }

  render() {
    const {
      author,

      date,
      paragraphs = [],
      //parentScrollViewRef,
    } = this.props
    const currentTimestamp = Date.now() / 1000
    const duration = currentTimestamp - date
    const diffString = moment.duration(duration, 'seconds').humanize()

    const {
      isReady,
      imagesToDisplay,
      videosToDisplay
    } = this.state
    if(!isReady){
      return <View style={styles.postContainer}>
        <View style={styles.postContainerTop}>
        </View>
      </View>
    }
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
          {/*<View style={styles.postItemBookmark}>
            {saved ? (<UnpinPostIcon />) : (<PinPostIcon />)}
          </View>*/}
        </View>

        <View style={styles.postContainer}>
        {/*<UserInfo author={author} date={date} />*/}
        {paragraphs.map(paragraph => (
          <Text style={xStyles.paragraph} key={paragraph.id}>
            {paragraph.text}
          </Text>
        ))}
        {videosToDisplay.length > 0 && (
          <ShockWebView
            type="video"
            width={videosToDisplay[0].width}
            height={videosToDisplay[0].height}
            magnet={videosToDisplay[0].data}
          />
        )}
        {videosToDisplay.length === 0 && imagesToDisplay.length > 0 && (
          <ShockWebView
            type="image"
            width={imagesToDisplay[0].width}
            height={imagesToDisplay[0].height}
            magnet={imagesToDisplay[0].data}
          />
        )}
        {this.renderRibbon()}
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
