import React from 'react'
import {
  ListRenderItemInfo,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Text,
  View,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from 'react-native'
import { connect } from 'react-redux'
import Http from 'axios'
import { NavigationScreenProp } from 'react-navigation'
import { NavigationBottomTabOptions } from 'react-navigation-tabs'
import _ from 'lodash'
import * as Common from 'shock-common'

import * as Reducers from '../../store/reducers'
import Post from '../../components/Post/Feed'
import * as Routes from '../../routes'
import * as CSS from '../../res/css'
import * as Thunks from '../../store/thunks'
import Tabs from '../../components/tabs'
import * as Follows from '../../store/reducers/follows'
import ShockIconWhite from '../../assets/images/shockW.svg'
import ShockIconBlue from '../../assets/images/shockB.svg'
import ShockAvatar from '../../components/ShockAvatar'
import AddonIcon from '../../assets/images/feed/addon.svg'
import { CREATE_POST_DARK } from '../CreatePostDark'
import Pad from '../../components/Pad'

type Navigation = NavigationScreenProp<{}, Routes.UserParams>
type Item = Common.Schema.Post

interface OwnProps {
  navigation: Navigation
}

interface StateProps {
  posts: Common.Schema.Post[]
  myFeed: import('../../store/reducers/myFeed').State
  follows: Follows.State
  avatar: string | null
}

interface DispatchProps {
  FetchPage: (page: number, currentPosts: Common.Schema.Post[]) => void
}

interface FollowInfo {
  publicKey: string
  avatar: string | null
  displayName: string
}

type Props = StateProps & DispatchProps & OwnProps

interface State {
  awaitingBackfeed: boolean
  awaitingMoreFeed: boolean
  followsInfo: Record<string, FollowInfo>
}

const keyExtractor = (item: Common.Schema.Post) => item.id

class Feed extends React.Component<Props, State> {
  static navigationOptions: NavigationBottomTabOptions = {
    tabBarIcon: ({ focused }) => {
      if (focused) {
        return <ShockIconBlue style={{ width: 32, height: 32 }} />
      } else {
        return <ShockIconWhite style={{ width: 32, height: 32 }} />
      }
    },
  }

  state: State = {
    awaitingBackfeed: false,
    awaitingMoreFeed: false,
    followsInfo: {},
  }

  componentDidMount() {
    const { follows } = this.props

    const pubs = Object.entries(follows).map(
      ([_, follow]: [string, Follows.Follow]) => {
        return follow.user
      },
    )
    if (pubs.length === 0) {
      return
    }
    Http.post('/api/gun/userInfo', { pubs })
      .then(res => {
        const rec: Record<string, FollowInfo> = {}
        const { pubInfos }: { pubInfos: FollowInfo[] } = res.data
        pubInfos.forEach(follow => {
          rec[follow.publicKey] = follow
        })
        this.setState({ followsInfo: rec })
      })
      .catch(() => {})
  }
  componentDidUpdate(prevProps: Props) {
    const currLen = Object.entries(this.props.follows).length
    const oldLen = Object.entries(prevProps.follows).length
    if (currLen !== oldLen) {
      //TMP
      const { follows } = this.props

      const pubs = Object.entries(follows).map(
        ([_, follow]: [string, Follows.Follow]) => {
          return follow.user
        },
      )
      if (pubs.length === 0) {
        return
      }
      Http.post('/api/gun/userInfo', { pubs })
        .then(res => {
          const rec: Record<string, FollowInfo> = {}
          const { pubInfos }: { pubInfos: FollowInfo[] } = res.data
          pubInfos.forEach(follow => {
            rec[follow.publicKey] = follow
          })
          this.setState({ followsInfo: rec })
        })
        .catch(() => {})
    }
  }

  onEndReached = () => {
    const { myFeed } = this.props
    this.props.FetchPage(myFeed.lastPageFetched, myFeed.posts)
  }

  onRefresh = () => {
    this.props.FetchPage(0, []) //clear and reload
  }

  renderItem = ({ item }: ListRenderItemInfo<Item>) => {
    if (!Common.Schema.isPost(item)) return null
    const imageCIEntries = Object.entries(item.contentItems).filter(
      ([_, ci]) => ci.type === 'image/embedded',
    ) as [
      string,
      Common.Schema.EmbeddedImage & { isPreview: boolean; isPrivate: boolean },
    ][]

    const videoCIEntries = Object.entries(item.contentItems).filter(
      ([_, ci]) => ci.type === 'video/embedded',
    ) as [
      string,
      Common.Schema.EmbeddedVideo & { isPreview: boolean; isPrivate: boolean },
    ][]

    const paragraphCIEntries = Object.entries(item.contentItems).filter(
      ([_, ci]) => ci.type === 'text/paragraph',
    ) as [string, Common.Schema.Paragraph][]

    const images = imageCIEntries.map(([key, imageCI]) => ({
      id: key,
      data: imageCI.magnetURI,
      width: Number(imageCI.width),
      height: Number(imageCI.height),
      isPreview: imageCI.isPreview,
      isPrivate: imageCI.isPrivate,
    }))

    const videos = videoCIEntries.map(([key, videoCI]) => ({
      id: key,
      data: videoCI.magnetURI,
      width: Number(videoCI.width),
      height: Number(videoCI.height),
      isPreview: videoCI.isPreview,
      isPrivate: videoCI.isPrivate,
    }))

    const paragraphs = paragraphCIEntries.map(([key, paragraphCI]) => ({
      id: key,
      text: paragraphCI.text,
    }))

    return (
      <Post
        author={item.author}
        date={item.date}
        images={images}
        videos={videos}
        paragraphs={paragraphs}
        parentScrollViewRef={undefined}
        //@ts-ignore
        tipValue={item.tipValue ? item.tipValue : 0}
        //@ts-ignore
        tipCounter={item.tipCounter ? item.tipCounter : 0}
      />
    )
  }

  onPressMyAvatar = () => this.props.navigation.navigate(CREATE_POST_DARK)
  onPressUserAvatar = (publicKey: string) => () =>
    this.props.navigation.navigate(Routes.USER, { publicKey })

  renderFollow({ item }: ListRenderItemInfo<[() => boolean, FollowInfo]>) {
    const [onPress, info] = item
    return (
      <View style={styles.otherUserContainer}>
        <ShockAvatar
          height={63}
          image={info.avatar || null}
          onPress={onPress}
          lastSeenApp={null}
          avatarStyle={styles.avatarStyle}
          disableOnlineRing
        />
        <Text style={styles.otherUserName}>{info.displayName}</Text>
      </View>
    )
  }
  prepareFollowsInfo(): [() => boolean, FollowInfo][] {
    const { followsInfo } = this.state
    const infos: [() => boolean, FollowInfo][] = []
    const folArr = Object.values(followsInfo)
    folArr.forEach(info => {
      infos.push([this.onPressUserAvatar(info.publicKey), info])
    })

    return infos
  }

  debouncedOnEndReached = _.debounce(this.onEndReached, 1000)
  render() {
    const { posts, myFeed, avatar } = this.props

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <View style={styles.usersContainer}>
          <TouchableOpacity style={styles.avatarContainer}>
            <ShockAvatar
              height={63}
              image={avatar}
              onPress={this.onPressMyAvatar}
              lastSeenApp={Date.now()}
              avatarStyle={styles.avatarStyle}
              disableOnlineRing
            />
            <AddonIcon size={25} style={styles.avatarAddon} />
          </TouchableOpacity>

          <FlatList
            data={this.prepareFollowsInfo()}
            renderItem={this.renderFollow}
            horizontal
          />
        </View>

        <Pad amount={8} />
        <Tabs texts={TABS} selectedTabIndex={0} />
        <Pad amount={8} />

        <FlatList
          renderItem={this.renderItem}
          data={myFeed.posts}
          keyExtractor={keyExtractor}
          ListEmptyComponent={listEmptyElement}
          onEndReached={this.debouncedOnEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={this.state.awaitingBackfeed}
              onRefresh={this.onRefresh}
            />
          }
          ListFooterComponent={posts.length ? listFooterElement : null}
        />
      </SafeAreaView>
    )
  }
}

const TABS = ['Feed', 'Saved', 'Videos']

const listFooterElement = <ActivityIndicator />

const mapStateToProps = (state: Reducers.State): StateProps => {
  const postsIDs = _.flattenDeep(state.feed.currentFeed)
  const noRepeats = _.uniq(postsIDs)

  const posts = Common.Schema.denormalizePosts(noRepeats, state)

  return {
    posts,
    avatar: state.users[state.auth.gunPublicKey].avatar,
    myFeed: state.myFeed,
    follows: state.follows,
  }
}

const mapDispatchToProps = (dispatch: any) => ({
  FetchPage: (page: number, currentPosts: Common.Schema.Post[]) => {
    dispatch(Thunks.myFeed.FetchPage(page, currentPosts))
  },
})
const ConnectedFeed = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Feed)

export default ConnectedFeed

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#16191C',
    margin: 0,
    flex: 1,
    width: '100%',
    paddingTop: StatusBar.currentHeight,
  },
  emptyMessageText: {
    color: CSS.Colors.TEXT_GRAY,
    fontFamily: 'Montserrat-700',
    fontSize: 16,
  },
  usersContainer: {
    flexDirection: 'row',
    marginTop: 30,
    paddingTop: 19,
    paddingBottom: 0,
    paddingLeft: 15,
    paddingRight: 6,
    borderColor: '#707070',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    height: 115,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#212937',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 17,
  },
  avatarAddon: {
    marginLeft: -25,
    marginTop: -15,
  },
  avatarStyle: {
    borderRadius: 32,
    borderColor: '#707070',
  },
  otherUserName: {
    color: '#F3EFEF',
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 9,
  },
  otherUserContainer: {
    marginRight: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherUserAvatar: {
    width: 53,
    height: 53,
    borderRadius: 27,
  },
})

const xStyles = {
  emptyMessageTextContainer: [CSS.styles.flex, CSS.styles.deadCenter],
}

const listEmptyElement = (
  <View style={xStyles.emptyMessageTextContainer}>
    <Text style={styles.emptyMessageText}>
      Follow people to see their posts
    </Text>
  </View>
)
