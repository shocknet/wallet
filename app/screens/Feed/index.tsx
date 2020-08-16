import React from 'react'
import {
  ListRenderItemInfo,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Text,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { NavigationScreenProp, NavigationScreenOptions } from 'react-navigation'
import _ from 'lodash'
import * as Common from 'shock-common'

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'

import * as Reducers from '../../../reducers'
import Post from '../../components/Post'
import * as Routes from '../../routes'
import * as CSS from '../../res/css'

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
}

class Feed extends React.Component<
  StateProps & DispatchProps & OwnProps,
  State
> {
  static navigationOptions: NavigationScreenOptions = {
    header: null,
    tabBarIcon: ({ focused }) => {
      return (
        <FontAwesome5
          color={
            focused ? CSS.Colors.BLUE_MEDIUM_DARK : CSS.Colors.GRAY_MEDIUM_LIGHT
          }
          name="bolt"
          // reverseColor={'#CED0CE'}
          size={32}
        />
      )
    },
  }

  state: State = {
    awaitingBackfeed: false,
    awaitingMoreFeed: false,
  }

  onEndReached = () => {
    console.warn(`onEndReached`)
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
    if (!this.state.awaitingBackfeed) {
      this.setState(
        {
          awaitingBackfeed: true,
        },
        () => {
          this.props.requestBackfeed()
        },
      )
    }
  }

  renderItem = ({ item }: ListRenderItemInfo<Item>) => {
    if (!Common.Schema.isPost(item)) return null
    const imageCIEntries = Object.entries(item.contentItems).filter(
      ([_, ci]) => ci.type === 'image/embedded',
    ) as [string, Common.Schema.EmbeddedImage][]

    const paragraphCIEntries = Object.entries(item.contentItems).filter(
      ([_, ci]) => ci.type === 'text/paragraph',
    ) as [string, Common.Schema.Paragraph][]

    const images = imageCIEntries.map(([key, imageCI]) => ({
      id: key,
      data: imageCI.magnetURI,
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
        paragraphs={paragraphs}
        // @ts-expect-error
        parentScrollViewRef={undefined}
      />
    )
  }

  keyExtractor = (item: Item) => item.id

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          renderItem={this.renderItem}
          data={this.props.posts}
          keyExtractor={this.keyExtractor}
          ListEmptyComponent={
            <View style={[CSS.styles.flex, CSS.styles.deadCenter]}>
              <Text style={styles.emptyMessageText}>
                Follow people to see their posts
              </Text>
            </View>
          }
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={this.state.awaitingBackfeed}
              onRefresh={this.onRefresh}
            />
          }
        />
      </SafeAreaView>
    )
  }
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
    flex: 1,
    width: '100%',
    backgroundColor: CSS.Colors.BACKGROUND_NEAR_WHITE,
  },
  emptyMessageText: {
    color: CSS.Colors.TEXT_GRAY,
    fontFamily: 'Montserrat-700',
    fontSize: 16,
  },
})
