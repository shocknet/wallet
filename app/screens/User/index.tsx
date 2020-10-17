import React from 'react'
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
  FlatList,
  ListRenderItemInfo,
  ImageBackground,
  Animated,
  Platform,
} from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { NavigationStackScreenProps } from 'react-navigation-stack'
import produce from 'immer'
import * as Common from 'shock-common'
import _ from 'lodash'
import Modal from 'react-native-modal'
import { connect } from 'react-redux'
import { StackNavigationOptions } from 'react-navigation-stack/lib/typescript/src/vendor/types'

import * as CSS from '../../res/css'
import QR from '../WalletOverview/QR'
import Pad from '../../components/Pad'
import * as Thunks from '../../thunks'
import QrCode from '../../assets/images/qrcode.svg'
import TapCopy from '../../assets/images/profile/tapcopy.svg'
import * as Store from '../../../store'
import * as Routes from '../../routes'
import { rifle } from '../../services'

export const MY_PROFILE = 'MY_PROFILE'

const DEFAULT_USER_IMAGE = ''

interface OwnProps {
  navigation: NavigationStackScreenProps<Routes.UserParams, {}>['navigation']
}

interface StateProps {
  avatar: string | null
  header: string | null
  displayName: string | null
  bio: string | null
  posts: Common.Schema.PostN[]
}

interface DispatchProps {}

type Props = OwnProps & StateProps & DispatchProps

interface State {
  scrollY: Animated.Value
  showQrCodeModal: boolean
  numOfPages: number
  posts: Record<string, Common.Schema.PostBase>
}

class User extends React.PureComponent<Props, State> {
  static navigationOptions: StackNavigationOptions = {
    headerTransparent: true,
    headerBackImage: () => (
      <Ionicons
        name="ios-arrow-round-back"
        color={CSS.Colors.BORDER_WHITE}
        size={40}
      />
    ),
    headerTitleStyle: {
      display: 'none',
    },
  }

  state: State = {
    scrollY: new Animated.Value(0),
    showQrCodeModal: false,
    numOfPages: 0,
    posts: {},
  }

  numOfPagesSocket: ReturnType<typeof rifle> | null = null

  pageToSocket: Record<number, ReturnType<typeof rifle>> = {}

  componentDidMount() {
    const publicKey = this.props.navigation.getParam('publicKey')
    this.numOfPagesSocket = rifle(`${publicKey}::wall.numOfPages::on`)

    this.numOfPagesSocket.on('$shock', (numOfPages: number) => {
      console.warn(`recievednumofpages: ${numOfPages}`)
      this.setState({
        numOfPages,
      })
    })
  }

  componentWillUnmount() {
    this.numOfPagesSocket!.off('*')
    this.numOfPagesSocket!.close()
    this.numOfPagesSocket = null

    for (const socket of Object.values(this.pageToSocket)) {
      socket!.off('*')
      socket!.close()
    }

    this.pageToSocket = {}
  }

  componentDidUpdate(__: Props, { numOfPages: prevNumOfPages }: State) {
    const { numOfPages } = this.state

    if (numOfPages === 0) {
      return
    }

    const publicKey = this.props.navigation.getParam('publicKey')

    if (numOfPages > prevNumOfPages) {
      console.warn(
        `trying with range: ${JSON.stringify(
          _.range(prevNumOfPages, numOfPages),
        )}`,
      )
      for (const page of _.range(prevNumOfPages, numOfPages)) {
        if (!this.pageToSocket[page]) {
          // we can use open because posts don't change
          this.pageToSocket[page] = rifle(
            `${publicKey}::wall.pages.${page}.posts::open`,
          )

          this.pageToSocket[page]!.on(
            '$shock',
            (posts: Record<string, unknown>) => {
              console.warn('got data')
              try {
                this.setState(state =>
                  produce(state, draft => {
                    for (const [id, post] of Object.entries(posts)) {
                      if (!Common.Schema.isObj(post)) {
                        continue
                      }

                      draft.posts[id] = {
                        ...post,
                        id,
                      } as Common.Schema.PostBase
                    }
                  }),
                )
              } catch (err) {
                console.warn('an error')
                console.warn(err)
              }
            },
          )

          this.pageToSocket[page]!.on('$err', (err: string) => {
            console.warn(`error for page ${page}: ${err}`)
          })
        }
      }
    }
  }

  renderItem = ({  }: ListRenderItemInfo<Common.Schema.PostBase>) => {
    return null
  }

  render() {
    const { avatar, header, bio, displayName, navigation } = this.props
    const publicKey = navigation.getParam('publicKey')

    const headerHeight = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      extrapolate: 'clamp',
    })
    const avatarWidth = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [130, 50],
      extrapolate: 'clamp',
    })
    const avatarRadius = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [65, 25],
      extrapolate: 'clamp',
    })
    const imgMargin = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [-30, -200],
      extrapolate: 'clamp',
    })
    const extrasOpacity = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    })

    return (
      <>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        <Modal
          isVisible={this.state.showQrCodeModal}
          backdropColor="#16191C"
          backdropOpacity={0.94}
          animationIn="zoomInDown"
          animationOut="zoomOutUp"
          animationInTiming={600}
          animationOutTiming={600}
          backdropTransitionInTiming={600}
          backdropTransitionOutTiming={600}
        >
          <View style={styles.qrViewModal}>
            <StatusBar
              translucent
              backgroundColor="rgba(22, 25, 28, .94)"
              barStyle="light-content"
            />

            <View style={styles.subContainerDark}>
              <React.Fragment>
                <QR
                  size={180}
                  logoToShow="shock"
                  value={`$$__SHOCKWALLET__USER__${publicKey}`}
                />
                <Pad amount={10} />
                <Text style={styles.bodyTextQrModal}>
                  Other users can scan this QR to contact you.
                </Text>

                <TouchableOpacity style={styles.tapButtonQrModal}>
                  <TapCopy size={30} />
                  <Text style={styles.tapButtonQrModalText}>
                    Tap to copy to clipboard
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            </View>
          </View>
        </Modal>

        <View style={styles.container}>
          <Animated.View
            style={{
              position: 'absolute',
              zIndex: 9,
              width: '100%',
              height: headerHeight,
              overflow: 'hidden',
            }}
          >
            <ImageBackground
              source={{
                uri: 'data:image/jpeg;base64,' + (header || ''),
              }}
              resizeMode="cover"
              style={styles.backImage}
            />

            <Animated.View style={[styles.overview, { marginTop: imgMargin }]}>
              <Animated.Image
                source={
                  avatar === null || avatar.length === 0
                    ? {
                        uri: 'data:image/jpeg;base64,' + DEFAULT_USER_IMAGE,
                      }
                    : {
                        uri: 'data:image/jpeg;base64,' + avatar,
                      }
                }
                style={{
                  width: avatarWidth,
                  height: avatarWidth,
                  borderRadius: avatarRadius,
                  overflow: 'hidden',
                }}
              />

              <View style={styles.bio}>
                <TouchableOpacity disabled={displayName === null}>
                  <Text style={styles.displayNameDark}>
                    {displayName || 'Loading...'}
                  </Text>
                </TouchableOpacity>

                <Pad amount={8} />

                <Animated.View style={{ opacity: extrasOpacity }}>
                  <Text style={styles.bodyTextDark}>{bio || 'Loading...'}</Text>
                </Animated.View>
              </View>
            </Animated.View>
          </Animated.View>

          <FlatList
            style={CSS.styles.width100}
            overScrollMode={'never'}
            scrollEventThrottle={16}
            onScroll={Animated.event([
              { nativeEvent: { contentOffset: { y: this.state.scrollY } } },
            ])}
            renderItem={this.renderItem}
            data={Object.values(this.state.posts)}
            keyExtractor={keyExtractor}
          />

          <TouchableOpacity
            style={styles.createBtn}
            // change to share
          >
            <View>
              <QrCode size={25} />
            </View>
          </TouchableOpacity>
        </View>
      </>
    )
  }
}

const HEADER_MAX_HEIGHT = 300
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT

const styles = StyleSheet.create({
  bodyText: {
    color: CSS.Colors.TEXT_GRAY_LIGHT,
    fontFamily: 'Montserrat-400',
    fontSize: 12,
    marginLeft: 90,
    marginRight: 90,
    textAlign: 'center',
  },
  bodyTextDark: {
    color: '#F3EFEF',
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    textAlign: 'left',
  },
  bodyTextQrModal: {
    color: '#5B5B5B',
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    textAlign: 'center',
  },
  createBtn: {
    height: 75,
    width: 75,
    borderRadius: 38,
    backgroundColor: CSS.Colors.CAUTION_YELLOW,
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dialog: {
    alignItems: 'stretch',
  },

  displayName: {
    color: CSS.Colors.TEXT_GRAY,
    fontFamily: 'Montserrat-700',
    fontSize: 16,
  },
  displayNameDark: {
    textShadowColor: '#16191C',
    textShadowRadius: 3,
    color: '#F3EFEF',
    fontFamily: 'Montserrat-700',
    fontSize: 16,
    textShadowOffset: { width: 0.5, height: 0.5 },
  },

  container: {
    alignItems: 'center',
    backgroundColor: '#16191C',
    flex: 1,
    margin: 0,
    justifyContent: 'flex-start',
  },

  subContainer: {
    alignItems: 'center',
  },
  subContainerDark: {
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 34,
    borderRadius: 24,
    marginHorizontal: 25,
  },
  backImage: {
    width: '100%',
    height: 170,
    backgroundColor: CSS.Colors.FUN_BLUE,
  },
  overview: {
    flexDirection: 'row',
    alignItems: 'center',
    //marginTop: -30,
    paddingHorizontal: 20,
  },
  avatarStyle: {
    borderWidth: 5,
    borderRadius: 100,
    borderColor: '#707070',
  },
  bio: {
    flexDirection: 'column',
    flex: 2,
    marginLeft: 20,
    paddingTop: 55,
  },
  configButtonDark: {
    width: '48%',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: CSS.Colors.TRANSPARENT,
    borderColor: '#4285B9',
    borderWidth: 1,
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
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
  actionButtonDark: {
    width: '100%',
    height: 79,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(33, 41, 55, .7)',
    borderColor: '#4285B9',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    marginBottom: 7,
    flexDirection: 'row',
    paddingLeft: '30%',
  },
  actionButtonTextDark: {
    color: '#F3EFEF',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
    marginLeft: 20,
  },
  mainButtons: {
    width: '100%',
  },
  qrViewModal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapButtonQrModal: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    marginTop: 15,
  },
  tapButtonQrModalText: {
    color: '#5B5B5B',
    fontFamily: 'Montserrat-600',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
})

const mapDispatchToProps = (dispatch: any) => ({
  DeletePost: (postInfo: {
    postId: string
    page: number
    posts: Common.Schema.Post[]
  }) => {
    dispatch(Thunks.MyWall.DeletePost(postInfo))
  },
  FetchPage: (page: number, posts: Common.Schema.Post[]) => {
    dispatch(Thunks.MyWall.FetchPage(page, posts))
  },
})

const makeMapStateToProps = () => {
  const getUser = Store.makeGetUser()

  return (state: Store.State, { navigation }: OwnProps): StateProps => {
    const publicKey = navigation.getParam('publicKey')
    const { avatar, bio, header, displayName } = getUser(state, publicKey)

    return {
      avatar,
      bio,
      header,
      displayName,
      posts: [],
    }
  }
}

const keyExtractor = (item: Common.Schema.PostBase) => {
  return item.id
}
export default connect(
  makeMapStateToProps,
  mapDispatchToProps,
)(User)
