import React from 'react'
import {
  ListRenderItemInfo,
  StyleSheet,
  FlatList,
  Text,
  View,
  ScrollView,
  StatusBar,
} from 'react-native'
import { connect } from 'react-redux'

import { NavigationScreenProp } from 'react-navigation'
import { NavigationBottomTabOptions } from 'react-navigation-tabs'
import _ from 'lodash'
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
import { CREATE_POST_DARK } from '../CreatePostDark'
import Pad from '../../components/Pad'
import * as Store from '../../store'

type Navigation = NavigationScreenProp<{}, Routes.UserParams>

interface OwnProps {
  navigation: Navigation
}

interface StateProps {
  posts: Common.Schema.PostN[]
  usersFollowed: Common.Schema.User[]
  publicKey: string
}

interface DispatchProps {}

type Props = StateProps & DispatchProps & OwnProps

const keyExtractor = (item: Common.Schema.PostN) => item.id
const userKeyExtractor = (item: Common.Schema.User) => item.publicKey

class Feed extends React.PureComponent<Props> {
  static navigationOptions: NavigationBottomTabOptions = {
    tabBarIcon: ({ focused }) => {
      if (focused) {
        return <ShockIconBlue style={CSS.styles.square32} />
      } else {
        return <ShockIconWhite style={CSS.styles.square32} />
      }
    },
  }

  renderItem = ({ item, index }: ListRenderItemInfo<Common.Schema.PostN>) => {
    return (
      <View>
        <Post id={item.id} showTipBtn hideTopBorder={index === 0} />
        <Pad amount={12} />
      </View>
    )
  }

  onPressMyAvatar = () => this.props.navigation.navigate(CREATE_POST_DARK)

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

  renderPerson = ({ item }: ListRenderItemInfo<Common.Schema.User>) => {
    return (
      <View style={CSS.styles.alignItemsCenter}>
        <ConnectedShockAvatar height={64} publicKey={item.publicKey} />

        <Pad amount={16} />

        <Text style={styles.otherUserName}>{item.displayName}</Text>
      </View>
    )
  }

  render() {
    return (
      <>
        <StatusBar
          backgroundColor={CSS.Colors.DARK_MODE_BACKGROUND_DARK}
          barStyle="light-content"
          translucent={false}
        />

        <ScrollView
          stickyHeaderIndices={STICKY_HEADER_INDICES}
          style={CSS.styles.backgroundDark}
        >
          <FlatList
            style={styles.usersContainer}
            data={this.props.usersFollowed}
            renderItem={this.renderPerson}
            horizontal
            keyExtractor={userKeyExtractor}
            nestedScrollEnabled
            ListHeaderComponent={this.renderMe}
            ItemSeparatorComponent={PersonSeparator}
            ListFooterComponent={PersonSeparator}
          />

          {/* mind the index of this component inside the components list in relation to "stickyHeaderIndices" above */}
          <View style={CSS.styles.backgroundDark}>
            <Pad amount={8} />
            <Tabs texts={TABS} selectedTabIndex={0} />
            <Pad amount={8} />
            <View style={styles.line}></View>
          </View>

          <FlatList
            renderItem={this.renderItem}
            data={this.props.posts}
            keyExtractor={keyExtractor}
            ListEmptyComponent={listEmptyElement}
          />
        </ScrollView>
      </>
    )
  }
}

const PersonSeparator = React.memo(() => <Pad amount={16} insideRow />)

const STICKY_HEADER_INDICES = [1]

const TABS = ['Feed', 'Saved', 'Videos']

const mapStateToProps = (state: Reducers.State): StateProps => {
  const publicKey = Store.getMyPublicKey(state)
  const posts = Store.getPostsFromFollowed(state)

  return {
    posts,
    publicKey,
    usersFollowed: Store.getFollowedUsers(state),
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
  otherUserName: {
    color: '#F3EFEF',
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    textAlign: 'center',
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
