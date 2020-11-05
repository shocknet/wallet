import React from 'react'
import {
  StyleSheet,
  Text,
  View,
  ViewProps,
  TouchableWithoutFeedback,
  ToastAndroid,
} from 'react-native'
import { Schema } from 'shock-common'
import { connect } from 'react-redux'
import pickBy from 'lodash/pickBy'
import Carousel from 'react-native-snap-carousel'
import size from 'lodash/size'
import isFinite from 'lodash/isFinite'
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

import UserInfo from './UserInfoNew'
import TipPopup from './tip-popup'

interface OwnProps {
  id: string
  showTipBtn?: boolean
  hideTopBorder?: boolean
}

interface StateProps {
  authorPublicKey: string
  contentItems: Record<string, Schema.ContentItem>
  numOfTips: number
  showMenuBtn: boolean
  isPinned: boolean
}

interface DispatchProps {
  pin(): void
  remove(): void
  unpin(): void
}

interface State {
  mediaWidth: number | null
  menuOpen: boolean
  tipPopupOpen: boolean
  showingRibbon: boolean
  tipAmt: number
}

type Props = OwnProps & StateProps & DispatchProps

class Post extends React.PureComponent<Props, State> {
  state: State = {
    mediaWidth: null,
    menuOpen: false,
    tipPopupOpen: false,
    showingRibbon: true,
    tipAmt: 0,
  }

  tipAmtSocket: null | ReturnType<typeof Services.rifle> = null

  componentDidMount = () => {
    const { authorPublicKey, id } = this.props
    this.tipAmtSocket = Services.rifle(
      `${authorPublicKey}::posts>${id}>tipCounter::on`,
    )
    this.tipAmtSocket.on('$shock', (tipAmt: unknown) => {
      if (typeof tipAmt === 'number' && isFinite(tipAmt) && tipAmt >= 0) {
        this.setState({ tipAmt })
      } else {
        Logger.log(
          `post: ${id} -- got bad tipAmt: ${typeof tipAmt} -- rendered: ${tipAmt}`,
        )
      }
    })
  }

  componentWillUnmount = () => {
    if (this.tipAmtSocket) {
      this.tipAmtSocket.off('*')
      this.tipAmtSocket.close()
      this.tipAmtSocket = null
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
    const { numOfTips } = this.props
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
              {numOfTips} <Text style={styles.ribbonTextBold}>Tips</Text>
            </Text>
          </View>
        ) : null}
      </View>
    )
  }

  onPressShare = () => {
    ToastAndroid.show('Coming soon!', ToastAndroid.LONG)
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
    const { id, contentItems, showTipBtn, isPinned, hideTopBorder } = this.props
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
          <UserInfo
            postID={id}
            onPressMenuIcon={
              this.props.showMenuBtn ? this.toggleMenu : undefined
            }
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

            <View
              // TODO: Why width100 pushes out share buton?
              style={showTipBtn ? undefined : CSS.styles.opacityZero}
            >
              <ShockIcon width={24} height={24} />
            </View>

            <TouchableWithoutFeedback onPress={this.onPressShare}>
              <Share size={16} />
            </TouchableWithoutFeedback>
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

    if (!post) {
      return {
        authorPublicKey: state.auth.gunPublicKey,
        contentItems: {},
        numOfTips: 0,
        showMenuBtn: false,
        isPinned: false,
      }
    }

    const user = getUser(state, post.author)

    return {
      authorPublicKey: post.author,
      contentItems: post.contentItems,
      numOfTips: 0,
      showMenuBtn: myPublicKey === post.author,
      isPinned: post.id === user.pinnedPost,
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
})

const MemoizedPost = React.memo(Post)
const ConnectedPost = connect(
  mapState,
  mapDispatch,
)(MemoizedPost)
export default ConnectedPost
