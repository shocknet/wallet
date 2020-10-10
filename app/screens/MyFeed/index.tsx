import React from 'react'
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  StatusBar,
  FlatList,
  ImageBackground,
  Image,
} from 'react-native'
import {
  NavigationScreenProp,
} from 'react-navigation'
import { NavigationBottomTabOptions } from 'react-navigation-tabs'
type Navigation = NavigationScreenProp<{}>

import * as API from '../../services/contact-api'
import * as CSS from '../../res/css'
import ShockAvatar from '../../components/ShockAvatar'
import moment from 'moment'

import PinPostIcon from '../../assets/images/feed/pin.svg'
import UnpinPostIcon from '../../assets/images/feed/unpin.svg'
import GotoDetailIcon from '../../assets/images/feed/gotodetail.svg'
import AddonIcon from '../../assets/images/feed/addon.svg'
import ShockIcon from '../../res/icons'

export const MY_FEED = 'MY_FEED'

interface Props {
  navigation: Navigation
}

interface State {
  avatar: string | null
  selectedTab: string
}

export default class MyFeed extends React.Component<Props, State> {
  static navigationOptions: NavigationBottomTabOptions = {
    tabBarIcon: ({ focused }) => (
      <ShockIcon
        name="solid-feed"
        color={focused ? CSS.Colors.BUTTON_BLUE : CSS.Colors.TEXT_WHITE}
        size={32}
      />
    ),
  }

  state: State = {
    avatar: API.Events.getAvatar(),
    selectedTab: 'all',
  }

  onPressAvatar = () => {}

  // @ts-ignore
  _renderUserItem({ item }) {
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
  }

  // @ts-ignore
  _renderPostItem({ item }) {
    const currentTimestamp = Date.now() / 1000
    const duration = currentTimestamp - item.timestamp
    const diffString = moment.duration(duration, 'seconds').humanize()

    return (
      <View style={styles.postContainer}>
        <View style={styles.postContainerTop}>
          <Image
            source={item.avatar}
            resizeMode="cover"
            style={styles.postItemAvatar}
          />
          <View style={styles.postItemTitle}>
            <Text style={styles.postItemTitleText}>{item.title}</Text>
            <Text style={styles.postItemTimestamp}>{diffString + ' ago'}</Text>
          </View>
          <View style={styles.postItemBookmark}>
            {item.saved ? <UnpinPostIcon /> : <PinPostIcon />}
          </View>
        </View>
        <View style={styles.postContainerBody}>
          <Text style={styles.postItemDescription}>{item.description}</Text>
          {/*<ScalableImage*/}
          {/*  width={Dimensions.get('window').width - 30} // height will be calculated automatically*/}
          {/*  source={item.image}*/}
          {/*/>*/}
          {/*<View style={styles.postItemPrice}>*/}
          {/*  <Text style={styles.postItemProductName}>{item.productName}</Text>*/}
          {/*  <Text style={styles.postItemProductPrice}>*/}
          {/*    {item.productPrice + ' ' + item.unit}*/}
          {/*  </Text>*/}
          {/*</View>*/}
          <ImageBackground
            source={item.image}
            resizeMode="cover"
            style={styles.postItemImage}
          >
            <View style={styles.postItemPrice}>
              <Text style={styles.postItemProductName}>{item.productName}</Text>
              <Text style={styles.postItemProductPrice}>
                {item.productPrice + ' ' + item.unit}
              </Text>
            </View>
          </ImageBackground>
        </View>
        <View style={styles.postContainerBottom}>
          <TouchableOpacity onPress={this.gotoPostDetail}>
            <GotoDetailIcon />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  gotoPostDetail = (_item: any) => {}

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
    const testUsers = [
      {
        avatar: {
          uri:
            'https://dukeofyorksquare.com/wp-content/uploads/2017/02/Pancakes-2.jpg',
        },
        name: 'David',
      },
      {
        avatar: {
          uri:
            'https://www.flatironsquare.co.uk/content/_mobile/Food_Hero_Image.jpg',
        },
        name: 'James',
      },
      {
        avatar: {
          uri:
            'https://dukeofyorksquare.com/wp-content/uploads/2017/02/Pancakes-2.jpg',
        },
        name: 'Karem',
      },
      {
        avatar: {
          uri:
            'https://mariettasquaremarket.com/wp-content/uploads/2018/12/Pita-Mediterranean-5.jpg',
        },
        name: 'Jhon',
      },
      {
        avatar: {
          uri:
            'https://www.pietrzaka030.macombserver.net/itwp1000/webproject4/images/basil.jpg',
        },
        name: 'Fabio',
      },
    ]

    const testData = [
      {
        title: "Pepe's restaurant",
        timestamp: 1598141174,
        saved: true,
        avatar: {
          uri:
            'https://www.flatironsquare.co.uk/content/_mobile/Food_Hero_Image.jpg',
        },
        description:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam ...',
        video: 'https://www.youtube.com/watch?v=PCwL3-hkKrg',
        image: {
          uri:
            'https://guidable.co/wp-content/uploads/2018/10/fake-plastic-food-1487542_1920.jpg',
        },
        productName: 'Red wine',
        productPrice: 0.000365,
        unit: 'sats',
      },
      {
        title: 'Mark suckemberk',
        timestamp: 1598141554,
        avatar: {
          uri:
            'https://www.flatironsquare.co.uk/content/_mobile/Food_Hero_Image.jpg',
        },
        description:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam ...',
        video: 'https://www.youtube.com/watch?v=PCwL3-hkKrg',
        image: {
          uri:
            'https://guidable.co/wp-content/uploads/2018/10/fake-plastic-food-1487542_1920.jpg',
        },
        productName: 'Red wine',
        productPrice: 0.000365,
        unit: 'BTC',
      },
      {
        title: "Pepe's restaurant",
        timestamp: 1598141157,
        avatar: {
          uri:
            'https://www.flatironsquare.co.uk/content/_mobile/Food_Hero_Image.jpg',
        },
        description:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam ...',
        image: {
          uri:
            'https://guidable.co/wp-content/uploads/2018/10/fake-plastic-food-1487542_1920.jpg',
        },
        productName: 'Red wine',
        productPrice: 0.000365,
        unit: 'BTC',
      },
      {
        title: "Pepe's restaurant",
        timestamp: 1598058532,
        saved: true,
        avatar: {
          uri:
            'https://www.flatironsquare.co.uk/content/_mobile/Food_Hero_Image.jpg',
        },
        description:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam ...',
        video: 'https://www.youtube.com/watch?v=PCwL3-hkKrg',
        image: {
          uri:
            'https://guidable.co/wp-content/uploads/2018/10/fake-plastic-food-1487542_1920.jpg',
        },
        productName: 'Red wine',
        productPrice: 0.000365,
        unit: 'BTC',
      },
      {
        title: "Pepe's restaurant",
        timestamp: 1598058532,
        saved: true,
        avatar: {
          uri:
            'https://www.flatironsquare.co.uk/content/_mobile/Food_Hero_Image.jpg',
        },
        description:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam ...',
        video: 'https://www.youtube.com/watch?v=PCwL3-hkKrg',
        image: {
          uri:
            'https://guidable.co/wp-content/uploads/2018/10/fake-plastic-food-1487542_1920.jpg',
        },
        productName: 'Red wine',
        productPrice: 0.000365,
        unit: 'BTC',
      },
    ]

    const { avatar, selectedTab } = this.state

    return (
      <View style={styles.container}>
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
              onPress={this.onPressAvatar}
              lastSeenApp={Date.now()}
              avatarStyle={styles.avatarStyle}
              disableOnlineRing
            />
            <AddonIcon size={25} style={styles.avatarAddon} />
          </TouchableOpacity>

          <FlatList
            data={testUsers}
            renderItem={this._renderUserItem}
            horizontal
          />
        </View>
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={this.onPressAllFeeds}
          >
            <Text
              style={
                selectedTab === 'all'
                  ? styles.tabButtonTextSelected
                  : styles.tabButtonText
              }
            >
              Feed
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={this.onPressSavedFeeds}
          >
            <Text
              style={
                selectedTab === 'saved'
                  ? styles.tabButtonTextSelected
                  : styles.tabButtonText
              }
            >
              Saved
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tabButton}
            onPress={this.onPressVideoFeeds}
          >
            <Text
              style={
                selectedTab === 'videos'
                  ? styles.tabButtonTextSelected
                  : styles.tabButtonText
              }
            >
              Videos
            </Text>
          </TouchableOpacity>
        </View>
        <View>
          <FlatList
            data={testData}
            renderItem={this._renderPostItem}
            style={styles.feedsFlatList}
          />
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#16191C',
    margin: 0,
    flex: 1,
  },
  avatarStyle: {
    borderRadius: 32,
    borderColor: '#707070',
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
  avatarAddon: {
    marginLeft: -25,
    marginTop: -15,
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
  otherUserName: {
    color: '#F3EFEF',
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 9,
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
  postContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#707070',
    paddingTop: 22,
    paddingHorizontal: 15,
    paddingBottom: 35,
    backgroundColor: '#212937',
    marginBottom: 15,
  },
  postContainerTop: {
    width: '100%',
    flexDirection: 'row',
  },
  postItemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 10,
  },
  postItemTitle: {
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 10,
  },
  postItemTitleText: {
    textAlign: 'left',
    fontFamily: 'Montserrat-700',
    fontSize: 15,
    color: '#F3EFEF',
  },
  postItemTimestamp: {
    color: '#F3EFEF',
    fontSize: 10,
    fontFamily: 'Montserrat-700',
    textAlign: 'left',
  },
  postItemBookmark: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  postContainerBody: {
    paddingTop: 13,
    paddingBottom: 10,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  postItemDescription: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-400',
    fontSize: 12,
    paddingRight: 16,
    paddingBottom: 4,
  },
  postItemPrice: {
    marginBottom: 26,
    marginRight: 0,
    borderTopLeftRadius: 9,
    borderBottomLeftRadius: 9,
    height: 42,
    backgroundColor: '#16191C',
    paddingRight: 18,
    paddingTop: 4,
    width: '40%',
  },
  postItemProductName: {
    textAlign: 'right',
    color: '#D1CBCB',
    fontFamily: 'Montserrat-600',
    fontSize: 12,
  },
  postItemProductPrice: {
    color: '#E1E7E5',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
    textAlign: 'right',
  },
  postContainerBottom: {
    alignItems: 'flex-end',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 17,
  },
  postItemImage: {
    width: '100%',
    height: 221,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  feedsFlatList: {
    marginBottom: 185,
  },
})
