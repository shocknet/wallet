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
}

interface Props {
  posts: Posts
  count: number
  totalPages: number
  getFeedPage: (pageNumber: number) => void
  navigation: Navigation
}

interface State {
  posts: Posts
  lastPageFetched: number
  loadingNextPage: boolean
}

class Feed extends React.Component<Props, State> {
  static navigationOptions: NavigationScreenOptions = {
    header: null,
  }

  state: State = {
    posts: [],
    lastPageFetched: 0,
    loadingNextPage: true,
  }

  componentDidMount() {
    this.fetchNextPage(0)
  }

  fetchNextPage = (pageNumber: number) => {
    this.setState({
      loadingNextPage: true,
    })
    this.props.getFeedPage(pageNumber)
  }

  renderItem = ({ item }: ListRenderItemInfo<Item>) => {
    return (
      <Post
        author={item.author}
        date={item.date}
        images={[]}
        // paragraphs={paragraphs}
        paragraphs={[]}
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
          data={this.state.posts}
          keyExtractor={this.keyExtractor}
          onEndReached={this.fetchNextPage}
          refreshControl={
            <RefreshControl
              refreshing={this.state.loadingNextPage}
              onRefresh={this.fetchNextPage}
            />
          }
        />
      </SafeAreaView>
    )
  }
}

const mapStateToProps = (state: Reducers.State): ConnectedProps => {
  const mockData = {
    count: 1,
    posts: {
      'kci1w4ro5sP94numFMGe~htWIQrIDmHGERmpVuJIx7dgOBtPagfY_aet1XogrLx4.JGi-XnnCuHAXcY_7OVmH5Z3XF3KWokOHB_017Jm79W4.': {
        contentItems: {
          'kci1w56zAyx6uCUE4E3W~htWIQrIDmHGERmpVuJIx7dgOBtPagfY_aet1XogrLx4.JGi-XnnCuHAXcY_7OVmH5Z3XF3KWokOHB_017Jm79W4.': {
            text: 'Helli',
            type: 'text/paragraph',
          },
        },
        date: 1594496239908,
        status: 'publish',
        tags: '',
        title: 'Post',
        id:
          'kci1w4ro5sP94numFMGe~htWIQrIDmHGERmpVuJIx7dgOBtPagfY_aet1XogrLx4.JGi-XnnCuHAXcY_7OVmH5Z3XF3KWokOHB_017Jm79W4.',
        author: {
          bio: 'A little bit about myself.',
          displayName: 'anonhtWIQrID',
          lastSeenApp: 1594500214223,
          lastSeenNode: 1594500210239,
          publicKey:
            'htWIQrIDmHGERmpVuJIx7dgOBtPagfY_aet1XogrLx4.JGi-XnnCuHAXcY_7OVmH5Z3XF3KWokOHB_017Jm79W4',
        },
      },
    },
    totalPages: 1,
  }
  const posts = mockData.posts
  const postsArr = (_.values(posts) as unknown) as Posts
  return {
    count: mockData.count,
    totalPages: mockData.totalPages,
    posts: postsArr,
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
    padding: CSS.SCREEN_PADDING,
  },
})
