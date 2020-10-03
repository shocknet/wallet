import React from 'react'
import {
  Clipboard,
  Text,
  StyleSheet,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,
  View,
  StatusBar,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  ImageBackground,
  ScrollView, Animated, Platform
} from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Logger from 'react-native-file-log'
import {
  NavigationScreenProp,
  NavigationBottomTabScreenOptions,
} from 'react-navigation'
import * as Common from 'shock-common'
import Http from 'axios'
import * as R from 'ramda'
// import { AirbnbRating } from 'react-native-ratings'
type Navigation = NavigationScreenProp<{}>

import * as API from '../../services/contact-api'
import * as CSS from '../../res/css'
import * as Cache from '../../services/cache'
import QR from '../WalletOverview/QR'
import Pad from '../../components/Pad'
import BasicDialog from '../../components/BasicDialog'
import Post from '../../components/Post/Wall'
import { PUBLISH_CONTENT_DARK } from '../../screens/PublishContentDark'

import SetBioDialog from './SetBioDialog'
import MetaConfigModal from './MetaConfigModal'

import profileBG from '../../assets/images/profile-bg.png'
// @ts-ignore
import SettingIcon from '../../assets/images/profile/setting-icon.svg'
// @ts-ignore
import QrCode from '../../assets/images/qrcode.svg'
// @ts-ignore
import TapCopy from '../../assets/images/profile/tapcopy.svg'
// @ts-ignore
import OfferProduct from '../../assets/images/profile/offer-product.svg'
// @ts-ignore
import OfferService from '../../assets/images/profile/offer-service.svg'
// @ts-ignore
import PublishContent from '../../assets/images/profile/publish-content.svg'
// @ts-ignore
import CreatePost from '../../assets/images/profile/create-post.svg'
// @ts-ignore
import ProfileIcon from '../../assets/images/navbar-icons/profile.svg'
// @ts-ignore
import ProfileIconFocused from '../../assets/images/navbar-icons/profile-focused.svg'
// @ts-ignore
import IconDrawerProfile from '../../assets/images/drawer-icons/icon-drawer-profile.svg'

import Modal from 'react-native-modal'
import { CREATE_POST_DARK as CREATE_POST } from '../CreatePostDark'

export const MY_PROFILE = 'MY_PROFILE'

const showCopiedToClipboardToast = () => {
  ToastAndroid.show('Copied to clipboard!', 800)
}

interface Props {
  navigation: Navigation
}

interface State {
  authData: Cache.AuthData | null
  avatar: string | null
  settingAvatar: boolean
  displayName: string | null
  displayNameDialogOpen: boolean
  displayNameInput: string
  settingDisplayName: boolean
  bio: string | null
  settingBio: boolean
  posts: Common.Schema.Post[]
  lastPageFetched: number
  loadingNextPage: boolean
  showQrCodeModal: boolean
  showMetaConfigModal: boolean,
  scrollY:Animated.Value
}


type Item =  Common.Schema.Post

const theme = 'dark'

const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = Platform.OS === 'ios' ? 60 : 73;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const DEFAULT_USER_IMAGE =
  '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'



export default class MyProfile extends React.Component<Props, State> {
  static navigationOptions: NavigationBottomTabScreenOptions = {
    tabBarIcon: ({ focused }) => {
      return (
        // <FontAwesome5
        //   color={
        //     focused ? CSS.Colors.BLUE_MEDIUM_DARK : CSS.Colors.GRAY_MEDIUM_LIGHT
        //   }
        //   name="user-circle"
        //   // reverseColor={'#CED0CE'}
        //   size={32}
        // />
        focused ? <ProfileIconFocused size={32} /> : <ProfileIcon size={32} />
      )
    },
    //@ts-ignore
    drawerIcon: ({ focused }) => {
      return (<IconDrawerProfile/>)
    },
  }

  state: State = {
    authData: null,
    avatar: API.Events.getAvatar(),
    settingAvatar: false,
    displayName: API.Events.getDisplayName(),
    displayNameDialogOpen: false,
    displayNameInput: '',
    settingDisplayName: false,
    bio: API.Events.currentBio,
    settingBio: false,
    posts: [],
    lastPageFetched: 0,
    loadingNextPage: true,
    showQrCodeModal: false,
    showMetaConfigModal: false,
    scrollY:new Animated.Value(0)
  }

  fetchNextPage = async () => {
    this.setState({
      loadingNextPage: true,
    })

    try {
      const res = await Http.get(
        `/api/gun/wall?page=${this.state.lastPageFetched - 1}`,
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

  setBioDialog: React.RefObject<SetBioDialog> = React.createRef()

  onAvatarUnsub = () => {}

  onDisplayNameUnsub = () => {}

  onBioUnsub = () => {}

  didFocus = { remove() {} }

  async componentDidMount() {
    this.didFocus = this.props.navigation.addListener('didFocus', () => {
      if (theme === 'dark') {
        StatusBar.setBackgroundColor(CSS.Colors.TRANSPARENT)
        StatusBar.setBarStyle('light-content')
      } else {
        StatusBar.setBackgroundColor(CSS.Colors.BACKGROUND_WHITE)
        StatusBar.setBarStyle('dark-content')
      }
    })
    this.onDisplayNameUnsub = API.Events.onDisplayName(dn => {
      this.setState({
        displayName: dn,
      })
    })

    this.onAvatarUnsub = API.Events.onAvatar(avatar => {
      this.setState({ avatar })
    })
    this.onBioUnsub = API.Events.onBio(bio => this.setState({ bio }))

    const authData = await Cache.getStoredAuthData()

    if (authData === null) {
      throw new Error('MyProfile -> Auth data is null')
    }

    this.setState({
      authData: authData.authData,
    })
    this.fetchNextPage()
  }

  componentWillUnmount() {
    this.didFocus.remove()
    this.onDisplayNameUnsub()
    this.onAvatarUnsub()
    this.onBioUnsub()
  }

  onChangeDisplayNameInput = (dn: string) => {
    this.setState({
      displayNameInput: dn,
    })
  }

  toggleSetupDisplayName = () => {
    this.setState(({ displayNameDialogOpen, displayName }) => ({
      displayNameDialogOpen: !displayNameDialogOpen,
      displayNameInput: displayNameDialogOpen ? '' : displayName || '',
    }))
  }

  setDisplayName = () => {
    const { displayNameInput } = this.state

    this.toggleSetupDisplayName()

    this.setState({
      settingDisplayName: true,
    })

    API.Actions.setDisplayName(displayNameInput)
      .then(() => {
        this.setState({
          displayName: displayNameInput,
        })
      })
      .catch(() => {})
      .finally(() => {
        this.setState({
          settingDisplayName: false,
        })
      })
  }

  copyDataToClipboard = () => {
    const { authData } = this.state

    if (authData === null) {
      return
    }

    const data = `$$__SHOCKWALLET__USER__${authData.publicKey}`

    Clipboard.setString(data)

    showCopiedToClipboardToast()
  }

  onPressAvatar = async () => {
    try {
      const AVATAR_EDGE = 320
      const image = await ImagePicker.openPicker({
        cropping: true,
        width: AVATAR_EDGE,
        height: AVATAR_EDGE,
        multiple: false,
        includeBase64: true,
        cropperCircleOverlay: true,
        useFrontCamera: true,
        compressImageQuality: 0.5,
        compressImageMaxWidth: AVATAR_EDGE,
        compressImageMaxHeight: AVATAR_EDGE,
        mediaType: 'photo',
      })

      if (Array.isArray(image)) {
        throw new TypeError(
          'Expected image obtained from image picker to not be an array',
        )
      }

      if (image.width > AVATAR_EDGE) {
        throw new RangeError('Expected image width to not exceed 640')
      }

      if (image.height > AVATAR_EDGE) {
        throw new RangeError('Expected image width to not exceed 640')
      }

      if (image.mime !== 'image/jpeg') {
        throw new TypeError('Expected image to be jpeg')
      }

      if (image.data === null) {
        throw new TypeError('image.data === null')
      }

      this.setState({
        settingAvatar: true,
      })

      await API.Actions.setAvatar(image.data)

      this.setState({
        avatar: image.data,
      })
    } catch (err) {
      Logger.log(err.message)
      ToastAndroid.show(
        `Error setting avatar: ${err.message}`,
        ToastAndroid.LONG,
      )
    } finally {
      this.setState({
        settingAvatar: false,
      })
    }
  }

  onPressBio = () => {
    const { current } = this.setBioDialog

    current && current.open()
  }

  onSubmitBio = (bio: string) => {
    this.setState({ settingBio: true })

    API.Actions.setBio(bio)
      .then(() => {
        this.setState({
          bio,
        })
      })
      .catch()
      .finally(() => {
        this.setState({ settingBio: false })
      })
  }

  onPressShowMyQrCodeModal = () => {
    if (this.state.showQrCodeModal) {
      this.setState({ showQrCodeModal: false })
    } else {
      this.setState({ showQrCodeModal: true })
    }
  }

  onPressMetaConfigModal = () => {
    if (this.state.showMetaConfigModal) {
      this.setState({ showMetaConfigModal: false })
    } else {
      this.setState({ showMetaConfigModal: true })
    }
  }

  renderItem = ({ item }: ListRenderItemInfo<Item>) => {
    if (Common.Schema.isPost(item)) {
      const imageCIEntries = Object.entries(item.contentItems).filter(
        ([_, ci]) => ci.type === 'image/embedded',
      ) as [string, (Common.Schema.EmbeddedImage & {isPreview:boolean,isPrivate:boolean})][]

      const videoCIEntries = Object.entries(item.contentItems).filter(
        ([_, ci]) => ci.type === 'video/embedded',
      ) as [string, (Common.Schema.EmbeddedVideo & {isPreview:boolean,isPrivate:boolean})][]

      const paragraphCIEntries = Object.entries(item.contentItems).filter(
        ([_, ci]) => ci.type === 'text/paragraph',
      ) as [string, Common.Schema.Paragraph][]

      const images = imageCIEntries.map(([key, imageCI]) => ({
        id: key,
        data: imageCI.magnetURI,
        width:Number(imageCI.width),
        height:Number(imageCI.height),
        isPreview:imageCI.isPreview,
        isPrivate:imageCI.isPrivate
      }))

      const videos = videoCIEntries.map(([key, videoCI]) => ({
        id: key,
        data: videoCI.magnetURI,
        width:Number(videoCI.width),
        height:Number(videoCI.height),
        isPreview:videoCI.isPreview,
        isPrivate:videoCI.isPrivate
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
    return <></>
    /* User data are already showed no need to show them again
    const {
      displayName,
      authData,
      avatar,
      displayNameInput,
      displayNameDialogOpen,
      bio,
    } = this.state

    if (authData === null) {
      return <ActivityIndicator size="large" />
    }

    return (
      <>
        <Pad amount={60} />
        <View style={styles.subContainer}>
          <TouchableOpacity>
            <ShockAvatar
              height={100}
              image={avatar}
              onPress={this.onPressAvatar}
              lastSeenApp={Date.now()}
              disableOnlineRing
            />
          </TouchableOpacity>

          <Pad amount={4} />

          <TouchableOpacity
            onPress={this.toggleSetupDisplayName}
            disabled={displayName === null}
          >
            <Text style={styles.displayName}>
              {displayName === null ? 'Loading...' : displayName}
            </Text>
          </TouchableOpacity>

          { <Pad amount={6} />

            <TouchableOpacity>
              <AirbnbRating
                defaultRating={0}
                isDisabled
                showRating={false}
                size={10}
              />
            </TouchableOpacity> }

          <Pad amount={8} />

          <TouchableOpacity onPress={this.onPressBio}>
            <Text style={styles.bodyText}>{bio || 'Loading...'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.subContainer}>
          <React.Fragment>
            <TouchableOpacity onPress={this.copyDataToClipboard}>
              <QR
                size={256}
                logoToShow="shock"
                value={`$$__SHOCKWALLET__USER__${authData.publicKey}`}
              />
            </TouchableOpacity>
            <Pad amount={10} />
            <Text style={styles.bodyTextQrModal}>
              Other users can scan this QR to contact you.
            </Text>
          </React.Fragment>
        </View>

        <BasicDialog
          onRequestClose={this.toggleSetupDisplayName}
          title="Display Name"
          visible={displayNameDialogOpen}
        >
          <View style={styles.dialog}>
            <ShockInput
              onChangeText={this.onChangeDisplayNameInput}
              value={displayNameInput}
            />

            <IGDialogBtn
              disabled={displayNameInput.length === 0}
              title="OK"
              onPress={this.setDisplayName}
            />
          </View>
        </BasicDialog>

        <SetBioDialog ref={this.setBioDialog} onSubmit={this.onSubmitBio} />
      </>
    )*/
  }

  getData = (): Item[] => {
    return  this.state.posts
  }

  keyExtractor = (item: Item) => {
    return (item as Common.Schema.Post).id
  }

  onPressCreate = () => {
    this.props.navigation.navigate(CREATE_POST)
  }

  onPressPublish = () => {
    this.props.navigation.navigate(PUBLISH_CONTENT_DARK)
  }


  render() {
    const {
      settingAvatar,
      settingBio,
      settingDisplayName,
      avatar,
      displayName,
      bio,
      authData,
    } = this.state

    const headerHeight = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      extrapolate: 'clamp',
    });
    const avatarWidth = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [130, 50],
      extrapolate: 'clamp',
    });
    const avatarRadius = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [65, 25],
      extrapolate: 'clamp',
    });
    const imgMargin = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [-30, -200],
      extrapolate: 'clamp',
    });
    const extrasOpacity = this.state.scrollY.interpolate({
      inputRange: [0, HEADER_SCROLL_DISTANCE],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    })

    if (theme === 'dark') {
      return (
        <View style={styles.container}>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle="light-content"
          />

          <View style={{ flex: 1 }}>
            <Modal
              isVisible={this.state.showQrCodeModal}
              backdropColor="#16191C"
              backdropOpacity={0.94}
              animationIn="zoomInDown"
              animationOut="zoomOutUp"
              animationInTiming={600}
              animationOutTiming={600}
              backdropTransitionInTiming={600}
              backdropTransitionOutTiming={600}
              onBackdropPress={this.onPressShowMyQrCodeModal}
            >
              <View style={styles.qrViewModal}>
                <StatusBar
                  translucent
                  backgroundColor="rgba(22, 25, 28, .94)"
                  barStyle="light-content"
                />

                <View style={styles.subContainerDark}>
                  <React.Fragment>
                    <TouchableOpacity onPress={this.copyDataToClipboard}>
                      {authData === null ? (
                        <ActivityIndicator size="large" />
                      ) : (
                        <QR
                          size={180}
                          logoToShow="shock"
                          value={`$$__SHOCKWALLET__USER__${authData.publicKey}`}
                        />
                      )}
                    </TouchableOpacity>
                    <Pad amount={10} />
                    <Text style={styles.bodyTextQrModal}>
                      Other users can scan this QR to contact you.
                    </Text>

                    <TouchableOpacity style={styles.tapButtonQrModal}>
                      <TapCopy size={30} />
                      <Text style={styles.tapButtonQrModalText}>
                        Tap to copy to clipboard
                      </Text>
                    </TouchableOpacity>
                  </React.Fragment>
                </View>
              </View>
            </Modal>
          </View>

          <View style={{ flex: 1 }}>
            <MetaConfigModal
              toggleModal={this.onPressMetaConfigModal}
              isModalVisible={this.state.showMetaConfigModal}
            />
          </View>

          <Animated.View style={{position:'absolute',zIndex:9,width:'100%',height:headerHeight,overflow:'hidden'}}
          >
          <ImageBackground
            source={profileBG}
            resizeMode="cover"
            style={styles.backImage}
          />
          <Animated.View style={[styles.overview,{marginTop:imgMargin}]}
          //style={{display:'flex',flexDirection:'row'}}
          >
            <TouchableOpacity>
              {/*<ShockAvatar
                height={133}
                image={avatar}
                onPress={this.onPressAvatar}
                lastSeenApp={Date.now()}
                avatarStyle={styles.avatarStyle}
                disableOnlineRing
              />*/}
              <Animated.Image
                source={
                  avatar === null || avatar.length === 0
                    ? {
                        uri: 'data:image/jpeg;base64,' + DEFAULT_USER_IMAGE,
                      }
                    : {
                        uri: 'data:image/jpeg;base64,' + avatar,
                      }
                }
                style={{width: avatarWidth,
                  height: avatarWidth,
                  borderRadius: avatarRadius,
                  overflow: "hidden"
                }}
              />
            </TouchableOpacity>
            <View style={styles.bio}
            >
              <TouchableOpacity
                onPress={this.toggleSetupDisplayName}
                disabled={displayName === null}
              >
                <Text style={styles.displayNameDark}
                >
                  {displayName === null ? 'Loading...' : displayName}
                </Text>
              </TouchableOpacity>

              <Pad amount={8} />

              <Animated.View style={{opacity:extrasOpacity}} >
                <TouchableOpacity onPress={this.onPressBio}>
                  <Text style={styles.bodyTextDark}
                  >{bio || 'Loading...'}</Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View style={{opacity:extrasOpacity}}>
                <TouchableOpacity
                  style={styles.configButtonDark}
                  onPress={this.onPressMetaConfigModal}
                >
                  <SettingIcon />
                  <Text style={styles.configButtonTextDark}
                  >Config</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
          </Animated.View>

          <ScrollView 
          overScrollMode={'never'}
          style={styles.mainButtons}
          scrollEventThrottle={16}
          //contentOffset={{x:0,y:-100}}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }]
          )}
          //scrollEnabled={false}
          
          >
            <View style={{width:'100%',height:300}}>

            </View>
            <TouchableOpacity style={styles.actionButtonDark}>
              <OfferProduct />
              <Text style={styles.actionButtonTextDark}>Offer a Product</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButtonDark}>
              <OfferService />
              <Text style={styles.actionButtonTextDark}>Offer a Service</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonDark}
              onPress={this.onPressPublish}
            >
              <PublishContent />
              <Text style={styles.actionButtonTextDark}>Publish Content</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButtonDark}
              onPress={this.onPressCreate}
            >
              <CreatePost />
              <Text style={styles.actionButtonTextDark}>Create a Post</Text>
            </TouchableOpacity>

            {this.state.loadingNextPage && <ActivityIndicator />}


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
          </ScrollView>

          <TouchableOpacity
            style={styles.createBtn}
            onPress={this.onPressShowMyQrCodeModal}
          >
            <View>
              <QrCode size={25} />
            </View>
          </TouchableOpacity>
        </View>
      )
    }
    return (
      <>
        <View style={styles.container}>
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

          <TouchableOpacity
            style={styles.createBtn}
            onPress={this.onPressCreate}
          >
            <View>
              <FontAwesome5 name="pencil-alt" color="white" size={22} />
            </View>
          </TouchableOpacity>
        </View>

        <BasicDialog
          visible={settingAvatar || settingBio || settingDisplayName}
          onRequestClose={() => {}}
        >
          <ActivityIndicator />
        </BasicDialog>
      </>
    )
  }
}

const styles = StyleSheet.create({
  bodyText: {
    color: CSS.Colors.TEXT_GRAY_LIGHT,
    fontFamily: 'Montserrat-400',
    fontSize: 12,
    marginLeft: 90,
    marginRight: 90,
    textAlign: 'center',
  },
  bodyTextDark: {
    color: '#F3EFEF',
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    textAlign: 'left',
  },
  bodyTextQrModal: {
    color: '#5B5B5B',
    fontFamily: 'Montserrat-600',
    fontSize: 12,
    textAlign: 'center',
  },
  createBtn: {
    height: 75,
    width: 75,
    borderRadius: 38,
    backgroundColor: CSS.Colors.CAUTION_YELLOW,
    position: 'absolute',
    right: 20,
    bottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dialog: {
    alignItems: 'stretch',
  },

  displayName: {
    color: CSS.Colors.TEXT_GRAY,
    fontFamily: 'Montserrat-700',
    fontSize: 16,
  },
  displayNameDark: {
    textShadowColor:'#16191C',
    textShadowRadius:3,
    color: '#F3EFEF',
    fontFamily: 'Montserrat-700',
    fontSize: 16,
    textShadowOffset: { width: 0.5, height: 0.5 }
  },

  container: {
    alignItems: 'center',
    backgroundColor: '#16191C',
    flex: 1,
    margin: 0,
    justifyContent: 'flex-start',
  },

  subContainer: {
    alignItems: 'center',
  },
  subContainerDark: {
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    padding: 34,
    borderRadius: 24,
    marginHorizontal: 25,
  },
  backImage: {
    width: '100%',
    height: 170,
    backgroundColor: CSS.Colors.FUN_BLUE,
  },
  overview: {
    flexDirection: 'row',
    alignItems:'center',
    //marginTop: -30,
    paddingHorizontal: 20,
  },
  avatarStyle: {
    borderWidth: 5,
    borderRadius: 100,
    borderColor: '#707070',
  },
  bio: {
    flexDirection: 'column',
    flex: 2,
    marginLeft: 20,
    paddingTop: 55,
  },
  configButtonDark: {
    width: '48%',
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: CSS.Colors.TRANSPARENT,
    borderColor: '#4285B9',
    borderWidth: 1,
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 5,
    elevation: 6,
    shadowColor: '#4285B9',
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 1, // IOS
    shadowRadius: 6, //IOS
  },
  configButtonTextDark: {
    color: '#4285B9',
    fontFamily: 'Montserrat-600',
    fontSize: 10,
    paddingLeft: 7,
  },
  actionButtonDark: {
    width: '100%',
    height: 79,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(33, 41, 55, .7)',
    borderColor: '#4285B9',
    borderBottomWidth: 1,
    borderTopWidth: 1,
    marginBottom: 7,
    flexDirection: 'row',
    paddingLeft: '30%',
  },
  actionButtonTextDark: {
    color: '#F3EFEF',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
    marginLeft: 20,
  },
  mainButtons: {
     width: '100%',
  },
  qrViewModal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapButtonQrModal: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    marginTop: 15,
  },
  tapButtonQrModalText: {
    color: '#5B5B5B',
    fontFamily: 'Montserrat-600',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
})
