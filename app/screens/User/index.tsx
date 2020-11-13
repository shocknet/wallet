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
import * as Common from 'shock-common'
import { connect } from 'react-redux'
import { StackNavigationOptions } from 'react-navigation-stack/lib/typescript/src/vendor/types'

import * as CSS from '../../res/css'
import Pad from '../../components/Pad'
import Post from '../../components/Post'
import * as Store from '../../store'
import * as Routes from '../../routes'
import Tabs from '../../components/tabs'
import FollowBtn from '../../components/FollowBtn'

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
  }

  renderItem = ({ item }: ListRenderItemInfo<Common.Schema.PostBase>) => {
    return (
      <View>
        <Post id={item.id} showTipBtn />
        <Pad amount={12} />
      </View>
    )
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

              <FollowBtn publicKey={publicKey} />
            </Animated.View>
          </Animated.View>

          <Tabs selectedTabIndex={0} texts={TABS} />

          <FlatList
            style={CSS.styles.width100}
            overScrollMode={'never'}
            scrollEventThrottle={16}
            onScroll={Animated.event([
              { nativeEvent: { contentOffset: { y: this.state.scrollY } } },
            ])}
            renderItem={this.renderItem}
            data={this.props.posts}
            keyExtractor={keyExtractor}
            // TODO: fix this
            ListHeaderComponent={listHeader}
          />
        </View>
      </>
    )
  }
}

const HEADER_MAX_HEIGHT = 300
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT

const styles = StyleSheet.create({
  bodyTextDark: {
    color: '#F3EFEF',
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    textAlign: 'left',
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
    backgroundColor: CSS.Colors.DARK_MODE_BACKGROUND_DARK,
    flex: 1,
    margin: 0,
    justifyContent: 'flex-start',
  },

  backImage: {
    width: '100%',
    height: 170,
    backgroundColor: CSS.Colors.FUN_BLUE,
  },
  overview: {
    flexDirection: 'row',
    alignItems: 'center',
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
})

const TABS = ['Wall', 'Items', 'Product']

const makeMapStateToProps = () => {
  const getUser = Store.makeGetUser()
  const getPostsForPublicKey = Store.makeGetPostsForPublicKey()

  return (state: Store.State, { navigation }: OwnProps): StateProps => {
    const publicKey = navigation.getParam('publicKey')
    const { avatar, bio, header, displayName } = getUser(state, publicKey)
    const posts = getPostsForPublicKey(state, publicKey)

    return {
      avatar,
      bio,
      header,
      displayName,
      posts,
    }
  }
}

const keyExtractor = (item: Common.Schema.PostBase) => {
  return item.id
}

// TODO: fix this
const listHeader = (
  <View
    style={{
      height: 300,
      backgroundColor: CSS.Colors.DARK_MODE_BACKGROUND_BLUEISH_GRAY,
    }}
  ></View>
)

export default connect(makeMapStateToProps)(User)
