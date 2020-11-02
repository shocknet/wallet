import React from 'react'
import {
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet,
  FlatList,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
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

  renderItem = ({ item }: ListRenderItemInfo<Common.Schema.PostN>) => {
    return (
      <View>
        <Post id={item.id} showTipBtn />
        <Pad amount={12} />
      </View>
    )
  }

  onPressMyAvatar = () => this.props.navigation.navigate(CREATE_POST_DARK)
  onPressUserAvatar = (publicKey: string) => () =>
    this.props.navigation.navigate(Routes.USER, { publicKey })

  renderFollow = ({ item }: ListRenderItemInfo<Common.Schema.User>) => {
    return (
      <View style={styles.otherUserContainer}>
        <View style={styles.avatarStyle}>
          <ConnectedShockAvatar
            height={63}
            disableOnlineRing
            publicKey={item.publicKey}
          />
        </View>

        <Text style={styles.otherUserName}>{item.displayName}</Text>
      </View>
    )
  }

  render() {
    const { publicKey } = this.props

    return (
      <>
        <StatusBar
          translucent
          backgroundColor="transparent"
          barStyle="light-content"
        />

        <SafeAreaView style={styles.container}>
          <ScrollView
            contentContainerStyle={CSS.styles.width100}
            nestedScrollEnabled
          >
            <View style={styles.usersContainer}>
              <TouchableOpacity style={styles.avatarContainer}>
                <View style={styles.avatarStyle}>
                  <ConnectedShockAvatar
                    height={63}
                    onPress={this.onPressMyAvatar}
                    publicKey={publicKey}
                    disableOnlineRing
                  />
                </View>

                <AddonIcon size={25} style={styles.avatarAddon} />
              </TouchableOpacity>

              <FlatList
                data={this.props.usersFollowed}
                renderItem={this.renderFollow}
                horizontal
                keyExtractor={userKeyExtractor}
                nestedScrollEnabled
              />
            </View>

            <Pad amount={8} />
            <Tabs texts={TABS} selectedTabIndex={0} />
            <Pad amount={8} />

            <FlatList
              style={CSS.styles.width100}
              renderItem={this.renderItem}
              data={this.props.posts}
              keyExtractor={keyExtractor}
              ListEmptyComponent={listEmptyElement}
              nestedScrollEnabled
            />
          </ScrollView>
        </SafeAreaView>
      </>
    )
  }
}

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
