import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'

import * as Common from 'shock-common'

import * as CSS from '../../res/css'

import ShockWebView from '../ShockWebView'
import moment from 'moment'
import { ConnectedShockAvatar } from '../ShockAvatar'
import * as MediaLib from '../../services/mediaLib'
import PopupMenu from '../popUpMenu'

interface MediaToDisplay {
  id: string
  data: string
  width: number
  height: number
  isPreview: boolean
  isPrivate: boolean
}

interface Props {
  author: Common.Schema.User
  date: number
  paragraphs: { id: string; text: string }[]
  images: MediaToDisplay[]
  videos: MediaToDisplay[]
  parentScrollViewRef: ScrollView | undefined
  postId: string
  postPage: string
  tipCounter: number
  tipValue: number
  deletePost: (postInfo: { page: string; id: string }) => void
}

interface State {
  isPrivate: boolean
  isAvailable: boolean
  isReady: boolean
  imagesToDisplay: MediaToDisplay[]
  videosToDisplay: MediaToDisplay[]
  privateImages: MediaToDisplay[]
  privateVideos: MediaToDisplay[]
  publicImages: MediaToDisplay[]
  publicVideos: MediaToDisplay[]
  selectedView: 'preview' | 'media'
}
const DEFAULT_STATE: State = {
  isAvailable: false,
  isPrivate: false,
  isReady: false,
  imagesToDisplay: [],
  videosToDisplay: [],
  privateImages: [],
  privateVideos: [],
  publicImages: [],
  publicVideos: [],
  selectedView: 'preview',
}

const popupMenuOptions: ['Pin', 'Remove'] = ['Pin', 'Remove']

export default class Post extends React.Component<Props, State> {
  gotoPostDetail = (_item: any) => {}

  state = DEFAULT_STATE

  async componentDidMount() {
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

    const imagePreviews: typeof images = []
    const imageMedias: typeof images = []
    const videoPreviews: typeof videos = []
    const videoMedias: typeof videos = []

    const privateVideos: typeof videos = []
    const privateImages: typeof images = []
    //fill an array with all the image media that isPreview and not
    images.forEach(e => {
      if (e.isPreview) {
        imagePreviews.push(e)
      } else {
        imageMedias.push(e)
      }
    })
    //fill an array with all the videos media that isPreview and not
    videos.forEach(e => {
      if (e.isPreview) {
        videoPreviews.push(e)
      } else {
        videoMedias.push(e)
      }
    })
    if (imagePreviews.length === 0 && videoPreviews.length === 0) {
      //this post has no preview, must be public, ribbon used for tip count
      this.setState({
        isReady: true,
        imagesToDisplay: imageMedias,
        videosToDisplay: videoMedias,
      })
    } else {
      //this post has a preview, check if it has private media
      videoMedias.forEach(e => {
        if (e.isPrivate) {
          privateVideos.push(e)
        }
      })
      imageMedias.forEach(e => {
        if (e.isPrivate) {
          privateImages.push(e)
        }
      })
      if (privateImages.length === 0 && privateVideos.length === 0) {
        //this post has a preview but no private media, ribbon used for tip count
        const anyPreview =
          imagePreviews.length > 0 ? imagePreviews[0] : videoPreviews[0]
        const anyMedia =
          videoMedias.length > 0 ? videoMedias[0] : imageMedias[0]
        if (anyPreview.data !== anyMedia.data) {
          //old public  post
          this.setState({
            isReady: true,
            imagesToDisplay: imageMedias,
            videosToDisplay: videoMedias,
          })
        } else {
          //new public post
          this.setState({
            isReady: true,
            imagesToDisplay: imagePreviews,
            videosToDisplay: videoPreviews,
            publicImages: imageMedias,
            publicVideos: videoMedias,
          })
        }
      } else {
        //this post has private media,check if the media is already paid
        const clearContent:
          | boolean
          | {
              images: typeof images
              videos: typeof videos
            } = await MediaLib.isContentAvailable(privateImages, privateVideos)
        if (clearContent === false) {
          //the content is not available display preview instead, ribbon is to pay
          this.setState({
            isReady: true,
            isPrivate: true,
            isAvailable: false,
            imagesToDisplay: imagePreviews,
            videosToDisplay: videoPreviews,
            privateImages: privateImages,
            privateVideos: privateVideos,
          })
        } else {
          //the content is private and is available, ribbon not used
          this.setState({
            isReady: true,
            isPrivate: true,
            isAvailable: true,
            imagesToDisplay: imageMedias,
            videosToDisplay: videoMedias,
          })
        }
      }
    }
  }

  renderRibbon = (): JSX.Element | null => {
    const { isPrivate, isAvailable, selectedView } = this.state
    if (selectedView === 'media') {
      return null
    }
    if (!isPrivate) {
      return null
    }
    if (!isAvailable) {
      return (
        <View style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <View
            style={{
              backgroundColor: '#16191C',
              position: 'relative',
              top: -120,
              width: 100,
            }}
          >
            <TouchableOpacity onPress={this.handlePaywallClick}>
              <Text style={{ color: 'white' }}>Paywall</Text>
              <Text style={{ color: 'white' }}>{'250' /*TMP*/}sats</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    }

    return null
  }

  handlePaywallClick = async () => {
    const { privateImages, privateVideos } = this.state
    this.setState({ isReady: false })
    const unlockedMedia = await MediaLib.getPrivateContent(
      privateImages,
      privateVideos,
    )
    this.setState({
      isReady: true,
      imagesToDisplay: unlockedMedia.images,
      videosToDisplay: unlockedMedia.videos,
      isPrivate: true,
      isAvailable: true,
    })
  }

  handlePublicClick = () => {
    const { selectedView } = this.state
    if (selectedView !== 'preview') {
      return
    }
    this.setState({
      selectedView: 'media',
    })
  }

  handlePopMenu = (event: string, index: number | undefined) => {
    if (event === 'itemSelected' && index !== undefined) {
      switch (popupMenuOptions[index]) {
        case 'Pin': {
          //set this post as pinned
          break
        }
        case 'Remove': {
          this.props.deletePost({
            page: this.props.postPage,
            id: this.props.postId,
          })
          break
        }
        default: {
        }
      }
    }
  }

  render() {
    const {
      author,
      tipCounter,
      tipValue,
      date,
      paragraphs = [],
      //parentScrollViewRef,
    } = this.props
    const duration = (Date.now() - date) / 1000
    const diffString = moment.duration(duration, 'seconds').humanize()

    const {
      isReady,
      imagesToDisplay,
      videosToDisplay,
      isPrivate,
      selectedView,
      publicImages,
      publicVideos,
    } = this.state
    if (!isReady) {
      return (
        <View style={styles.postContainer}>
          <View style={styles.postContainerTop}></View>
        </View>
      )
    }
    const privateVideoCond = isPrivate && videosToDisplay.length > 0
    const privateImageCond =
      isPrivate && videosToDisplay.length === 0 && imagesToDisplay.length > 0

    const video =
      selectedView === 'preview' ? videosToDisplay[0] : publicVideos[0]
    const image =
      selectedView === 'preview' ? imagesToDisplay[0] : publicImages[0]
    const publicMedia = video ? video : image
    const publicMediaCond = !isPrivate && publicMedia
    return (
      <View style={styles.postContainer}>
        <View style={styles.postContainerTop}>
          <ConnectedShockAvatar
            height={44}
            publicKey={author.publicKey}
            disableOnlineRing
          />

          <View style={styles.postItemTitle}>
            <Text style={styles.postItemTitleText}>{author.displayName}</Text>
            <Text style={styles.postItemTimestamp}>{diffString + ' ago'}</Text>
          </View>
          {/*<View style={styles.postItemBookmark}>
            {saved ? (<UnpinPostIcon />) : (<PinPostIcon />)}
          </View>*/}
          <PopupMenu actions={popupMenuOptions} onPress={this.handlePopMenu} />
        </View>

        <View style={styles.postContainer}>
          {/*<UserInfo author={author} date={date} />*/}
          {paragraphs.map(paragraph => (
            <Text style={xStyles.paragraph} key={paragraph.id}>
              {paragraph.text}
            </Text>
          ))}
          {privateVideoCond && (
            <ShockWebView
              type="video"
              width={videosToDisplay[0].width}
              height={videosToDisplay[0].height}
              magnet={videosToDisplay[0].data}
              updateToMedia={null}
            />
          )}
          {privateImageCond && (
            <ShockWebView
              type="image"
              width={imagesToDisplay[0].width}
              height={imagesToDisplay[0].height}
              magnet={imagesToDisplay[0].data}
              updateToMedia={null}
            />
          )}
          {publicMediaCond && (
            <ShockWebView
              type={videosToDisplay[0] ? 'video' : 'image'}
              width={publicMedia.width}
              height={publicMedia.height}
              magnet={publicMedia.data}
              updateToMedia={this.handlePublicClick}
            />
          )}
          {this.renderRibbon()}
        </View>
        <View>
          <View style={styles.configButtonDark}>
            <Text style={styles.configButtonTextDark}>
              {tipCounter} Tips - {tipValue} Sats
            </Text>
          </View>
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
    padding: 15,
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
  /*postContainerBottom: {
    alignItems: 'flex-end',
  },*/
  avatarStyle: {
    borderWidth: 5,
    borderRadius: 100,
    borderColor: '#707070',
    marginRight: 8,
  },
  configButtonDark: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: CSS.Colors.TRANSPARENT,
    borderColor: '#4285B9',
    borderWidth: 1,
    flexDirection: 'row',
    paddingVertical: 6,
    //paddingHorizontal: 12,
    marginTop: 5,
    elevation: 6,
    shadowColor: '#4285B9',
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 1, // IOS
    shadowRadius: 6, //IOS
  },
  configButtonTextDark: {
    color: '#4285B9',
    fontFamily: 'Montserrat-600',
    fontSize: 10,
    paddingLeft: 7,
  },
})

const xStyles = {
  paragraph: [
    styles.paragraphBase,
    CSS.styles.fontMontserrat,
    CSS.styles.fontSize14,
  ],
}
