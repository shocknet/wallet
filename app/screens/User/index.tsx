import React from 'react'
import {
  Clipboard,
  Text,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
} from 'react-native'
import moment from 'moment'
import { connect } from 'react-redux'
import * as Common from 'shock-common'
import Http from 'axios'
import * as R from 'ramda'
import Logger from 'react-native-file-log'

import { NavigationScreenProp, NavigationScreenOptions } from 'react-navigation'

import { SET_LAST_SEEN_APP_INTERVAL } from '../../services/utils'
import * as CSS from '../../res/css'
import { ConnectedShockAvatar } from '../../components/ShockAvatar'
import QR from '../WalletOverview/QR'
import Pad from '../../components/Pad'
import * as Reducers from '../../../reducers'
import * as Routes from '../../routes'
import { SafeAreaView } from 'react-navigation'
import FollowBtn from '../../components/FollowBtn'
import Post from '../../components/Post'
import TipBtn from '../../components/TipBtn'

type UserType = Common.Schema.User
type Navigation = NavigationScreenProp<{}, Routes.UserParams>

interface ConnectedProps {
  users: UserType[]
}

export interface Props extends ConnectedProps {
  navigation: Navigation
}

interface State {
  posts: Common.Schema.Post[]
  lastPageFetched: number
  loadingNextPage: boolean
}

const showCopiedToClipboardToast = () => {
  ToastAndroid.show('Copied to clipboard!', 800)
}

interface Sentinel {
  type: '@@Sentinel'
}

type Item = Sentinel | Common.Schema.Post

class User extends React.Component<Props, State> {
  static navigationOptions: NavigationScreenOptions = {
    header: undefined,
    headerStyle: {
      elevation: 0,
      shadowOpacity: 0,
      shadowOffset: {
        height: 0,
        width: 0,
      },
    },
  }

  intervalID: number | null = 0

  state: State = {
    lastPageFetched: 0,
    posts: [],
    loadingNextPage: true,
  }

  fetchNextPage = async () => {
    const publicKey = this.props.navigation.getParam('publicKey')
    if (!publicKey) {
      return
    }

    this.setState({
      loadingNextPage: true,
    })

    try {
      const res = await Http.get(
        `/api/gun/wall/${publicKey}?page=${this.state.lastPageFetched - 1}`,
      )

      if (res.status !== 200) {
        throw new Error(`Not 200`)
      }
      this.setState(({ posts, lastPageFetched }) => {
        const { posts: postsRecord } = res.data
        const fetchedPosts: Common.Schema.Post[] = Object.values(postsRecord)
        const mixedWithExisting = [...posts, ...fetchedPosts]
        const dedupped = R.uniqBy(R.prop('id'), mixedWithExisting)

        const sorted = R.sort((a, b) => b.date - a.date, dedupped)

        return {
          posts: sorted,
          lastPageFetched: lastPageFetched - 1,
        }
      })
    } catch (err) {
      Logger.log(err)
      ToastAndroid.show(
        `Error fetching posts: ${err.message ||
          err.errorMessage ||
          'Unknown error'}`,
        800,
      )
    } finally {
      this.setState({
        loadingNextPage: false,
      })
    }
  }

  reload = () => {
    this.setState(
      {
        lastPageFetched: 0,
      },
      this.fetchNextPage,
    )
  }

  componentDidMount() {
    this.intervalID = setInterval(() => {
      this.forceUpdate()
    }, SET_LAST_SEEN_APP_INTERVAL)

    this.fetchNextPage()
  }

  componentWillUnmount() {
    if (this.intervalID !== null) {
      clearInterval(this.intervalID)
      this.intervalID = null
    }
  }

  copyDataToClipboard = () => {
    const data = `$$__SHOCKWALLET__USER__${this.getUser().publicKey}`

    Clipboard.setString(data)

    showCopiedToClipboardToast()
  }

  getUser(): UserType {
    // TODO fix this
    return (
      this.props.users.find(
        u => u.publicKey === this.props.navigation.getParam('publicKey'),
      ) || {
        avatar: null,
        bio: null,
        displayName: null,
        lastSeenApp: 0,
        lastSeenNode: 0,
        publicKey: this.props.navigation.getParam('publicKey'),
      }
    )
  }

  renderItem = ({ item }: ListRenderItemInfo<Item>) => {
    if (Common.Schema.isPost(item)) {
      const imageCIEntries = Object.entries(item.contentItems).filter(
        ([_, ci]) => ci.type === 'image/embedded',
      ) as [string, Common.Schema.EmbeddedImage][]

      const videoCIEntries = Object.entries(item.contentItems).filter(
        ([_, ci]) => ci.type === 'video/embedded',
      ) as [string, Common.Schema.EmbeddedVideo][]

      const paragraphCIEntries = Object.entries(item.contentItems).filter(
        ([_, ci]) => ci.type === 'text/paragraph',
      ) as [string, Common.Schema.Paragraph][]

      const images = imageCIEntries.map(([key, imageCI]) => ({
        id: key,
        data: imageCI.magnetURI,
        width:Number(imageCI.width),
        height:Number(imageCI.height)
      }))
      
      const videos = videoCIEntries.map(([key, videoCI]) => ({
        id: key,
        data: videoCI.magnetURI,
        width:Number(videoCI.width),
        height:Number(videoCI.height)
      }))

      const paragraphhs = paragraphCIEntries.map(([key, paragraphCI]) => ({
        id: key,
        text: paragraphCI.text,
      }))

      return (
        <Post
          author={item.author}
          date={item.date}
          images={images}
          videos={videos}
          paragraphs={paragraphhs}
          parentScrollViewRef={undefined}
        />
      )
    }

    const { displayName, lastSeenApp, publicKey } = this.getUser()

    return (
      <View>
        <View style={styles.subContainer}>
          <TouchableOpacity>
            <ConnectedShockAvatar height={100} publicKey={publicKey} />
          </TouchableOpacity>

          <Pad amount={4} />

          <Text style={styles.displayName}>
            {displayName === null ? 'Loading...' : displayName}
          </Text>

          {/* <Pad amount={8} /> */}

          {/* <Text style={styles.bodyText}>{bio || 'Loading...'}</Text> */}

          <Text>
            {lastSeenApp === 0
              ? 'Not seen recently'
              : `Seen ${moment(lastSeenApp).fromNow()} ago`}
          </Text>
        </View>

        <View style={styles.subContainer}>
          <TouchableOpacity onPress={this.copyDataToClipboard}>
            <QR
              size={256}
              logoToShow="shock"
              value={`$$__SHOCKWALLET__USER__${publicKey}`}
            />
          </TouchableOpacity>
        </View>

        <TipBtn recipientsPublicKey={publicKey} />
        <FollowBtn publicKey={publicKey} />
      </View>
    )
  }

  getData = (): Item[] => {
    return [{ type: '@@Sentinel' }, ...this.state.posts]
  }

  keyExtractor = (item: Item) => {
    return (item as Common.Schema.Post).id || (item as Sentinel).type
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          renderItem={this.renderItem}
          data={this.getData()}
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
  //  TODO: find out a way to get a single user here
  const users = Reducers.selectAllUsers(state)
  const usersArr = Object.values(users) as Common.Schema.User[]

  return {
    users: usersArr,
  }
}

const ConnectedUserScreen = connect(mapStateToProps)(User)

export default ConnectedUserScreen

const styles = StyleSheet.create({
  displayName: {
    color: CSS.Colors.TEXT_GRAY,
    fontFamily: 'Montserrat-700',
    fontSize: 16,
  },

  container: {
    alignItems: 'center',
    backgroundColor: CSS.Colors.TEXT_WHITE,
    flex: 1,

    paddingBottom: 20,
    paddingTop: 20,
  },

  subContainer: {
    alignItems: 'center',
  },
})
