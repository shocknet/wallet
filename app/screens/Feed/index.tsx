import React from 'react'
import {
  ListRenderItemInfo,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Text,
} from 'react-native'
import { connect } from 'react-redux'
import { NavigationScreenProp, NavigationScreenOptions } from 'react-navigation'
import _ from 'lodash'
import * as Common from 'shock-common'

import * as Reducers from '../../../reducers'
import Post from '../../components/Post'
import * as Routes from '../../routes'
import * as CSS from '../../res/css'
import { thunkGetFeedPage } from '../../thunks/thunkFeed'

export const FEED = 'FEED'

type Posts = Common.Schema.Post[]
type Navigation = NavigationScreenProp<{}, Routes.UserParams>
type Item = Common.Schema.Post

interface ConnectedProps {
  posts: Posts
  count: number
  totalPages: number
  loadingNextPage: boolean
  lastPageFetched: number
}

interface Props {
  posts: Posts
  count: number
  totalPages: number
  loadingNextPage: boolean
  lastPageFetched: number
  getFeedPage: (pageNumber: number) => void
  navigation: Navigation
}

class Feed extends React.Component<Props> {
  static navigationOptions: NavigationScreenOptions = {
    header: null,
  }

  componentDidMount() {
    this.props.getFeedPage(0)
  }

  onEndReached = () => {
    if (Math.abs(this.props.lastPageFetched) >= this.props.totalPages - 1)
      return
    this.props.getFeedPage(this.props.lastPageFetched - 1)
  }

  onRefresh = () => {
    this.props.getFeedPage(0)
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

  keyExtractor = (item: Item) => (item as Common.Schema.Post).id

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          renderItem={this.renderItem}
          data={this.props.posts}
          keyExtractor={this.keyExtractor}
          ListEmptyComponent={
            <Text style={styles.emptyMessageText}>
              Follow people to see their posts
            </Text>
          }
          onEndReached={this.onEndReached}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={this.props.loadingNextPage}
              onRefresh={this.onRefresh}
            />
          }
        />
      </SafeAreaView>
    )
  }
}

const mapStateToProps = (state: Reducers.State): ConnectedProps => {
  const postsArr = (_.values(state.feedWall.posts) as unknown) as Posts
  return {
    count: state.feedWall.count,
    totalPages: state.feedWall.totalPages,
    posts: postsArr,
    loadingNextPage: state.feedWall.loadingNextPage,
    lastPageFetched: state.feedWall.lastPageFetched,
  }
}

const mapDispatchToProps = {
  getFeedPage: thunkGetFeedPage,
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
    textAlign: 'center',
    margin: 10,
  },
})
