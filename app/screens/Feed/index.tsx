import React from 'react'
import {
  ListRenderItemInfo,
  StyleSheet,
  FlatList,
  Text,
  View,
  StatusBar,
} from 'react-native'
import { connect } from 'react-redux'
import identity from 'lodash/identity'

import { NavigationScreenProp } from 'react-navigation'
import { NavigationBottomTabOptions } from 'react-navigation-tabs'
import * as Common from 'shock-common'

import * as Reducers from '../../store/reducers'
import Post from '../../components/Post'
import * as Routes from '../../routes'
import * as CSS from '../../res/css'
import Tabs from '../../components/tabs'
import ShockIconWhite from '../../assets/images/shockW.svg'
import ShockIconBlue from '../../assets/images/shockB.svg'
import { ConnectedShockAvatar } from '../../components/ShockAvatar'
import AddonIcon from '../../assets/images/feed/addon.svg'
import { CREATE_POST } from '../../routes'
import Pad from '../../components/Pad'
import * as Store from '../../store'

type Navigation = NavigationScreenProp<{}, Routes.UserParams>

interface OwnProps {
  navigation: Navigation
}

interface StateProps {
  posts: Common.Schema.PostN[]
  usersFollowed: string[]
  publicKey: string
}

interface DispatchProps {}

type Props = StateProps & DispatchProps & OwnProps

interface State {
  data: [string, ...Common.Schema.PostN[]]
}

class Feed extends React.PureComponent<Props, State> {
  static navigationOptions: NavigationBottomTabOptions = {
    tabBarIcon: ({ focused }) => {
      if (focused) {
        return <ShockIconBlue style={CSS.styles.square32} />
      } else {
        return <ShockIconWhite style={CSS.styles.square32} />
      }
    },
  }

  state: State = {
    data: ['tabs', ...this.props.posts],
  }

  componentDidUpdate({ posts: prevPosts }: Props) {
    if (this.props.posts !== prevPosts) {
      this.setState({
        data: ['tabs', ...this.props.posts],
      })
    }
  }

  renderItem = ({
    item,
    index,
  }: ListRenderItemInfo<Common.Schema.PostN | string>) => {
    if (typeof item === 'string') {
      return tabs
    }

    return (
      <View>
        <Post id={item.id} showTipBtn hideTopBorder={index === 1} />
        <Pad amount={12} />
      </View>
    )
  }

  onPressMyAvatar = () => this.props.navigation.navigate(CREATE_POST)

  renderMe = () => {
    const { publicKey } = this.props
    return (
      <View style={CSS.styles.flexRow}>
        <PersonSeparator />
        <View>
          <ConnectedShockAvatar
            height={64}
            onPress={this.onPressMyAvatar}
            publicKey={publicKey}
            disableOnlineRing
          />

          <AddonIcon size={25} style={styles.avatarAddon} />
        </View>
        <PersonSeparator />
      </View>
    )
  }

  renderPerson = ({ item }: ListRenderItemInfo<string>) => (
    <ConnectedShockAvatar height={64} publicKey={item} nameAtBottom />
  )

  renderPeople = () => (
    <FlatList
      style={styles.usersContainer}
      data={this.props.usersFollowed}
      renderItem={this.renderPerson}
      horizontal
      keyExtractor={identity}
      nestedScrollEnabled
      ListHeaderComponent={this.renderMe}
      ItemSeparatorComponent={PersonSeparator}
      ListFooterComponent={PersonSeparator}
    />
  )

  render() {
    return (
      <>
        <StatusBar
          backgroundColor={CSS.Colors.DARK_MODE_BACKGROUND_DARK}
          barStyle="light-content"
          translucent={false}
        />

        <FlatList
          stickyHeaderIndices={STICKY_HEADER_INDICES}
          style={CSS.styles.backgroundDark}
          renderItem={this.renderItem}
          data={this.state.data}
          keyExtractor={keyExtractor}
          ListEmptyComponent={listEmptyElement}
          ListHeaderComponent={this.renderPeople}
        />
      </>
    )
  }
}

const keyExtractor = (item: Common.Schema.PostN | string) => {
  // @ts-expect-error
  return item.id || item
}

const PersonSeparator = React.memo(() => <Pad amount={16} insideRow />)

const STICKY_HEADER_INDICES = [1]

const TABS = ['Feed']

const mapStateToProps = (state: Reducers.State): StateProps => {
  const publicKey = Store.getMyPublicKey(state)
  const posts = Store.getPostsFromFollowed(state)

  return {
    posts,
    publicKey,
    usersFollowed: Store.getFollowedPublicKeys(state),
  }
}

const ConnectedFeed = connect(mapStateToProps)(Feed)

export default ConnectedFeed

const styles = StyleSheet.create({
  line: {
    height: 0,
    borderBottomColor: CSS.Colors.DARK_MODE_BORDER_GRAY,
    borderBottomWidth: 1,
  },
  emptyMessageText: {
    color: CSS.Colors.TEXT_GRAY,
    fontFamily: 'Montserrat-700',
    fontSize: 16,
  },
  usersContainer: {
    backgroundColor: CSS.Colors.DARK_MODE_BACKGROUND_BLUEISH_GRAY,
    borderColor: CSS.Colors.DARK_MODE_BORDER_GRAY,
    borderWidth: 1,
    paddingVertical: 24,
  },
  avatarAddon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
})

const tabs = (
  <View style={CSS.styles.backgroundDark}>
    <Pad amount={8} />
    <Tabs texts={TABS} selectedTabIndex={0} />
    <Pad amount={8} />
    <View style={styles.line}></View>
  </View>
)

const listEmptyElement = (
  <View style={CSS.styles.flexDeadCenter}>
    <Text style={styles.emptyMessageText}>
      Follow people to see their posts
    </Text>
  </View>
)
