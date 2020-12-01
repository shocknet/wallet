import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  ViewProps,
  TouchableWithoutFeedback,
  ToastAndroid,
} from 'react-native'
import { Schema, Constants } from 'shock-common'
import { connect } from 'react-redux'
import pickBy from 'lodash/pickBy'
import Carousel from 'react-native-snap-carousel'
import size from 'lodash/size'
import Logger from 'react-native-file-log'

import * as Store from '../../store'
import * as CSS from '../../res/css'
import Pad from '../Pad'
import SeeMore from '../SeeMore'
import ShockWebView from '../ShockWebView'
import Share from '../../assets/images/share.svg'
import Dialog from '../ShockDialog'
import ShockIcon from '../../assets/images/shockB.svg'
import * as Services from '../../services'
import PostHeader from '../post-header'

import TipPopup from './tip-popup'

interface OwnProps {
  id: string
  hideTopBorder?: boolean
  showShareBtn?: boolean
  hideMenuBtn?: boolean
  smallerHeader?: boolean
}

interface StateProps {
  authorPublicKey: string
  contentItems: Record<string, Schema.ContentItem>
  tipCounter: number
  isPinned: boolean
  host: string
  date: number
  authorDisplayName: string
  showTipBtn: boolean
}

interface DispatchProps {
  pin(): void
  remove(): void
  unpin(): void
  tokenDidInvalidate(): void
}

interface State {
  mediaWidth: number | null
  menuOpen: boolean
  tipPopupOpen: boolean
  showingRibbon: boolean
}

type Props = OwnProps & StateProps & DispatchProps

class Post extends React.PureComponent<Props, State> {
  state: State = {
    mediaWidth: null,
    menuOpen: false,
    tipPopupOpen: false,
    showingRibbon: true,
  }

  postSocket: null | ReturnType<typeof Services.rifle> = null

  mounted = false

  componentDidMount = () => {
    this.mounted = true
    const { authorPublicKey, id, host } = this.props
    // TODO: hack, force gun to ask for this data
    // The data itself will be processed in saga
    this.postSocket = Services.rifle(
      host,
      `${authorPublicKey}::posts>${id}>contentItems::map.on`,
    )

    this.postSocket.on(Constants.ErrorCode.NOT_AUTH, () => {
      this.props.tokenDidInvalidate()
      this.postSocket && this.postSocket.off('*')
      this.postSocket && this.postSocket.close()
    })

    this.postSocket.on('$error', (e: string) => {
      Logger.log(`Error inside post contentItems socket: ${e}`)
    })
  }

  componentWillUnmount = () => {
    this.mounted = true

    if (this.postSocket) {
      this.postSocket.off('*')
      this.postSocket.close()
      this.postSocket = null
    }
  }

  getMediaItems() {
    const { contentItems } = this.props

    const media = pickBy(
      contentItems,
      v => v.type !== 'text/paragraph',
    ) as Record<string, Schema.EmbeddedImage | Schema.EmbeddedVideo>

    return media
  }

  getMaxMediaHeight() {
    return Math.min(
      Math.max(
        MIN_MEDIA_HEIGHT,
        ...Object.values(this.getMediaItems()).map(mi => Number(mi.height)),
      ),
      MAX_MEDIA_HEIGHT,
    )
  }

  onLayout: ViewProps['onLayout'] = ({
    nativeEvent: {
      layout: { width },
    },
  }) => {
    this.setState(({ mediaWidth }) => {
      if (mediaWidth) {
        return null
      }

      return {
        mediaWidth: (width || 0) - PADDING * 2,
      }
    })
  }

  onPressVideo = () => {
    this.setState({
      showingRibbon: false,
    })
  }

  onPressImage = () => {}

  renderMediaItem = ({
    item,
  }: {
    item: Schema.EmbeddedImage | Schema.EmbeddedVideo
  }) => {
    const { tipCounter } = this.props
    const { mediaWidth, showingRibbon } = this.state

    if (!mediaWidth) {
      return null
    }

    return (
      <View style={CSS.styles.backgroundBlack}>
        <ShockWebView
          height={Number(item.height)}
          magnet={item.magnetURI}
          type={item.type === 'image/embedded' ? 'image' : 'video'}
          width={Number(item.width)}
          onPress={
            item.type === 'image/embedded'
              ? this.onPressImage
              : this.onPressVideo
          }
        />

        {showingRibbon ? (
          <View style={styles.ribbon}>
            <Text style={styles.ribbonText}>
              {tipCounter} <Text style={styles.ribbonTextBold}>Tips</Text>
            </Text>
          </View>
        ) : null}
      </View>
    )
  }

  onPressShare = () => {
    const { id, authorPublicKey } = this.props

    const sharedPostRaw: Schema.SharedPostRaw = {
      originalAuthor: authorPublicKey,
      shareDate: Date.now(),
    }

    Services.post(`api/gun/put`, {
      path: `$user>sharedPosts>${id}`,
      value: sharedPostRaw,
    }).catch(e => {
      Logger.log(`Could not share post: ${id}`)
      Logger.log(e)
      ToastAndroid.show(`Could not share -> ${e.message}`, ToastAndroid.LONG)
    })

    ToastAndroid.show('Shared', ToastAndroid.LONG)
  }

  toggleMenu = () => {
    this.setState(({ menuOpen }) => ({ menuOpen: !menuOpen }))
  }

  choicesWhenPinned = {
    unpin: () => {
      this.props.unpin()
      this.toggleMenu()
    },
    remove: () => {
      this.props.remove()
      this.toggleMenu()
    },
  }

  choicesWhenUnpinned = {
    pin: () => {
      this.props.pin()
      this.toggleMenu()
    },
    remove: () => {
      this.props.remove()
      this.toggleMenu()
    },
  }

  toggleTipPopup = () => {
    this.setState(({ tipPopupOpen }) => ({
      tipPopupOpen: !tipPopupOpen,
    }))
  }

  render() {
    const {
      id,
      contentItems,
      showTipBtn,
      isPinned,
      hideTopBorder,
      authorPublicKey,
      authorDisplayName,
      smallerHeader,
      date,
      showShareBtn,
    } = this.props
    const { mediaWidth, tipPopupOpen } = this.state

    const paragraphs = pickBy(
      contentItems,
      v => v.type === 'text/paragraph',
    ) as Record<string, Schema.Paragraph>

    const text = Object.values(paragraphs)
      .map(p => p.text)
      .join('\n')

    const numOfMediaItems = size(this.getMediaItems())

    return (
      <>
        <View
          style={
            mediaWidth
              ? hideTopBorder
                ? styles.containerTopBorderHidden
                : styles.container
              : styles.containerCalculatingLayout
          }
          onLayout={this.onLayout}
        >
          <PostHeader
            authorDisplayName={authorDisplayName}
            onPressMenuIcon={
              this.props.hideMenuBtn ? undefined : this.toggleMenu
            }
            smaller={smallerHeader}
            authorPublicKey={authorPublicKey}
            timestamp={date}
          />
          <Pad amount={12} />
          {/* TODO: https://github.com/kashishgrover/react-native-see-more-inline/issues/3 */}
          <SeeMore numberOfLines={2} style={styles.paragraph}>
            {text}
          </SeeMore>

          {!!numOfMediaItems && !!mediaWidth && (
            <>
              <Pad amount={8} />
              <View>
                <Carousel
                  data={Object.values(this.getMediaItems())}
                  renderItem={this.renderMediaItem}
                  itemWidth={mediaWidth}
                  sliderWidth={mediaWidth}
                  lockScrollWhileSnapping
                  initialNumToRender={1}
                />
              </View>
            </>
          )}

          <Pad amount={12} />

          <View style={CSS.styles.rowCenteredSpaceBetween}>
            <View />

            <View style={showTipBtn ? undefined : CSS.styles.opacityZero}>
              <TouchableWithoutFeedback onPress={this.toggleTipPopup}>
                <ShockIcon width={24} height={24} />
              </TouchableWithoutFeedback>
            </View>

            {showShareBtn ? (
              <TouchableWithoutFeedback onPress={this.onPressShare}>
                <Share size={16} />
              </TouchableWithoutFeedback>
            ) : (
              <View />
            )}
          </View>
        </View>

        <Dialog
          onRequestClose={this.toggleMenu}
          visible={this.state.menuOpen}
          choiceToHandler={
            isPinned ? this.choicesWhenPinned : this.choicesWhenUnpinned
          }
        />

        <TipPopup
          onRequestClose={this.toggleTipPopup}
          postID={id}
          visible={tipPopupOpen}
        />
      </>
    )
  }
}

const PADDING = 24
const MIN_MEDIA_HEIGHT = 240
const MAX_MEDIA_HEIGHT = 480

const containerBase = {
  padding: PADDING,
  backgroundColor: CSS.Colors.DARK_MODE_BACKGROUND_BLUEISH_GRAY,
  borderColor: CSS.Colors.DARK_MODE_BORDER_GRAY,
  borderWidth: 1,
} as const

const styles = StyleSheet.create({
  container: containerBase,

  containerCalculatingLayout: {
    ...containerBase,
    opacity: 0,
  },

  containerTopBorderHidden: {
    ...containerBase,
    borderTopWidth: 0,
  },

  paragraph: {
    fontFamily: 'Montserrat-Light',
    color: CSS.Colors.TEXT_WHITE,
    fontSize: 12,
  },

  ribbon: {
    position: 'absolute',
    top: 12,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    paddingHorizontal: 48,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ribbonText: {
    textAlign: 'center',
    fontFamily: 'Montserrat-Regular',
    color: 'white',
  },
  ribbonTextBold: { fontFamily: 'Montserrat-Bold' },
})

const mapState = () => {
  const getUser = Store.makeGetUser()

  return (state: Store.State, ownProps: OwnProps): StateProps => {
    const post = Store.getPost(state, ownProps.id)
    const myPublicKey = Store.getMyPublicKey(state)
    const host = Store.selectHost(state)

    if (!post) {
      return {
        authorPublicKey: state.auth.gunPublicKey,
        contentItems: {},
        tipCounter: 0,
        isPinned: false,
        host,
        date: Date.now(),
        authorDisplayName: 'User',
        showTipBtn: false,
      }
    }

    const user = getUser(state, post.author)

    return {
      authorDisplayName: user.displayName || user.publicKey,
      authorPublicKey: user.publicKey,
      contentItems: post.contentItems,
      date: post.date,
      host,
      isPinned: post.id === user.pinnedPost,
      showTipBtn: post.author !== myPublicKey,
      tipCounter: post.tipCounter,
    }
  }
}

const mapDispatch = (
  dispatch: Store.Dispatch,
  { id }: OwnProps,
): DispatchProps => ({
  pin() {
    dispatch(Store.requestedPostPin(id))
  },
  unpin() {
    dispatch(Store.requestedPostUnpin())
  },
  remove() {
    dispatch(Store.requestedPostRemoval(id))
  },
  tokenDidInvalidate() {
    dispatch(Store.tokenDidInvalidate())
  },
})

const MemoizedPost = React.memo(Post)
const ConnectedPost = connect(
  mapState,
  mapDispatch,
)(MemoizedPost)
export default ConnectedPost
