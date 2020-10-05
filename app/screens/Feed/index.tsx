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
  FlatListProps, ScrollView
} from 'react-native'
import { connect } from 'react-redux'
import { NavigationScreenProp, NavigationScreenOptions } from 'react-navigation'
import _ from 'lodash'
import * as Common from 'shock-common'

import * as Reducers from '../../../reducers'
import Post from '../../components/Post/Feed'
import * as Routes from '../../routes'
import * as CSS from '../../res/css'
import * as API from '../../services/contact-api'

//@ts-ignore
import AddonIcon from '../../assets/images/feed/addon.svg'
//@ts-ignore
import ShockIconWhite from '../../assets/images/shockW.svg'
//@ts-ignore
import ShockIconBlue from '../../assets/images/shockB.svg'

type Navigation = NavigationScreenProp<{}, Routes.UserParams>
type Item = Common.Schema.Post

interface StateProps {
  posts: Common.Schema.Post[]
}

interface DispatchProps {
  requestBackfeed: () => void
  requestMoreFeed: () => void
  onViewportChanged: (newViewport: string[]) => void
}

interface OwnProps {
  navigation: Navigation
}

interface State {
  awaitingBackfeed: boolean
  awaitingMoreFeed: boolean
  avatar: string | null
  selectedTab: 'all' | 'saved' | 'videos'
}

type Props = StateProps & DispatchProps & OwnProps

const keyExtractor = (item: Common.Schema.Post) => item.id

class Feed extends React.Component<Props, State> {
  static navigationOptions: NavigationScreenOptions = {
    header: null,
    tabBarIcon: ({ focused }) => {
      if(focused){
        return (
          <ShockIconBlue style={{width:32,height:32}}/>
        )
      } else {
        return (
          <ShockIconWhite style={{width:32,height:32}}/>
        )
      }
    },
  }

  state: State = {
    awaitingBackfeed: false,
    awaitingMoreFeed: false,
    avatar: API.Events.getAvatar(),
    selectedTab: 'all',
  }

  onEndReached = () => {
    // todo: move this check to redux in a way that makes sense
    if (!this.state.awaitingMoreFeed) {
      this.setState(
        {
          awaitingMoreFeed: true,
        },
        () => {
          this.props.requestMoreFeed()
        },
      )
    }
  }

  onRefresh = () => {
    const { awaitingBackfeed, awaitingMoreFeed } = this.state

    if (!awaitingBackfeed && !awaitingMoreFeed) {
      this.setState(
        {
          awaitingBackfeed: true,
        },
        () => {
          if (this.props.posts.length === 0) {
            this.props.requestMoreFeed()
          } else {
            this.props.requestBackfeed()
          }

          // TODO: redux-side auto retry
          setTimeout(() => {
            this.setState({
              awaitingBackfeed: false,
              awaitingMoreFeed: false,
            })
          }, 10000)
        },
      )
    }
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
      />
    )
  }

  /*_renderUserItem({ item }) {
    return (
      <View style={styles.otherUserContainer}>
        <Image
          source={item.avatar}
          resizeMode="cover"
          style={styles.otherUserAvatar}
        />
        <Text style={styles.otherUserName}>{item.name}</Text>
      </View>
    )
  }*/

  _onViewableItemsChanged: FlatListProps<
    Common.Schema.Post
  >['onViewableItemsChanged'] = ({ viewableItems }) => {
    const posts = viewableItems.map(
      viewToken => viewToken.item,
    ) as Common.Schema.Post[]

    const ids = posts.map(p => p.id)

    this.props.onViewportChanged(ids)
  }

  // TODO: debounce in redux
  onViewableItemsChanged: FlatListProps<
    Common.Schema.Post
  >['onViewableItemsChanged'] = _.debounce(this
    ._onViewableItemsChanged as () => {})

  componentDidUpdate(prevProps: Readonly<Props>) {
    const { posts: prevPosts } = prevProps
    const { posts: currentPosts } = this.props
    const postsChanged = currentPosts !== prevPosts
    const wasLoadingBackfeed = this.state.awaitingBackfeed
    const wasLoadingFeed = this.state.awaitingMoreFeed

    if (!postsChanged) {
      return
    }

    if (prevPosts.length === 0 && currentPosts.length === 0) {
      // `TODO: update perf optimization`)
      return
    }

    // initial load
    if (prevPosts.length === 0 && currentPosts.length !== 0) {
      this.setState({
        awaitingBackfeed: false,
        awaitingMoreFeed: false,
      })
      return
    }

    const didLoadBackfeed = prevPosts[0].id !== currentPosts[0].id
    const didLoadFeed =
      prevPosts[prevPosts.length - 1].id !==
      currentPosts[currentPosts.length - 1].id

    if (wasLoadingBackfeed && didLoadBackfeed) {
      this.setState({
        awaitingBackfeed: false,
      })
    }

    if (wasLoadingFeed && didLoadFeed) {
      this.setState({
        awaitingMoreFeed: false,
      })
    }
  }
  onPressAvatar = () => {}

  onPressAllFeeds = () => {
    this.setState({ selectedTab: 'all' })
  }

  onPressSavedFeeds = () => {
    this.setState({ selectedTab: 'saved' })
  }

  onPressVideoFeeds = () => {
    this.setState({ selectedTab: 'videos' })
  }

  render() {
    const { posts } = this.props

    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />
        <ScrollView>
        <FlatList
          style={CSS.styles.flex}
          contentContainerStyle={CSS.styles.flex}
          renderItem={this.renderItem}
          data={posts}
          keyExtractor={keyExtractor}
          ListEmptyComponent={listEmptyElement}
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={this.state.awaitingBackfeed}
              onRefresh={this.onRefresh}
            />
          }
          ListFooterComponent={posts.length ? listFooterElement : null}
          onViewableItemsChanged={this.onViewableItemsChanged}
          viewabilityConfig={VIEWABILITY_CONFIG}
        />
        </ScrollView>
      </SafeAreaView>
    )
  }
}

const listFooterElement = <ActivityIndicator />

const VIEWABILITY_CONFIG: FlatListProps<
  Common.Schema.Post
>['viewabilityConfig'] = {
  /**
   * Minimum amount of time (in milliseconds) that an item must be physically viewable before the
   * viewability callback will be fired. A high number means that scrolling through content without
   * stopping will not mark the content as viewable.
   */
  minimumViewTime: 100,

  /**
   * Percent of viewport that must be covered for a partially occluded item to count as
   * "viewable", 0-100. Fully visible items are always considered viewable. A value of 0 means
   * that a single pixel in the viewport makes the item viewable, and a value of 100 means that
   * an item must be either entirely visible or cover the entire viewport to count as viewable.
   */
  viewAreaCoveragePercentThreshold: 10,
}

const mapStateToProps = (state: Reducers.State): StateProps => {
  const postsIDs = _.flattenDeep(state.feed.currentFeed)
  const noRepeats = _.uniq(postsIDs)

  const posts = Common.Schema.denormalizePosts(noRepeats, state)

  return {
    posts,
  }
}

const mapDispatchToProps: Record<
  keyof DispatchProps,
  (...args: any[]) => Common.Store.Actions.FeedAction
> = {
  onViewportChanged: Common.Store.Actions.viewportChanged,
  requestBackfeed: Common.Store.Actions.getMoreBackfeed,
  requestMoreFeed: Common.Store.Actions.getMoreFeed,
}

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
  tabsContainer: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#707070',
    height: 37,
    flexDirection: 'row',
  },
  tabButton: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonText: {
    fontFamily: 'Montserrat-700',
    fontSize: 15,
    color: '#F3EFEF',
  },
  tabButtonTextSelected: {
    fontFamily: 'Montserrat-700',
    fontSize: 15,
    color: '#4285B9',
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
