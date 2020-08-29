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
  ScrollView,
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
import ShockAvatar from '../../components/ShockAvatar'
import QR from '../WalletOverview/QR'
import Pad from '../../components/Pad'
import BasicDialog from '../../components/BasicDialog'
import ShockInput from '../../components/ShockInput'
import IGDialogBtn from '../../components/IGDialogBtn'
import Post from '../../components/Post'
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
  showMetaConfigModal: boolean
}

interface Sentinel {
  type: '@@Sentinel'
}

type Item = Sentinel | Common.Schema.Post

const theme = 'dark'

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
      ) as [string, Common.Schema.EmbeddedImage][]

      const paragraphCIEntries = Object.entries(item.contentItems).filter(
        ([_, ci]) => ci.type === 'text/paragraph',
      ) as [string, Common.Schema.Paragraph][]

      const images = imageCIEntries.map(([key, imageCI]) => ({
        id: key,
        data: imageCI.magnetURI,
      }))

      const paragraphhs = paragraphCIEntries.map(([key, paragraphCI]) => ({
        id: key,
        text: paragraphCI.text,
      }))

      return (
        <Post
          author={item.author}
          date={item.date}
          // @ts-expect-error
          images={images}
          paragraphs={paragraphhs}
          parentScrollViewRef={undefined}
        />
      )
    }

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

          {/* <Pad amount={6} />

            <TouchableOpacity>
              <AirbnbRating
                defaultRating={0}
                isDisabled
                showRating={false}
                size={10}
              />
            </TouchableOpacity> */}

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
    )
  }

  getData = (): Item[] => {
    return [{ type: '@@Sentinel' }, ...this.state.posts]
  }

  keyExtractor = (item: Item) => {
    return (item as Common.Schema.Post).id || (item as Sentinel).type
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

          <ImageBackground
            source={profileBG}
            resizeMode="cover"
            style={styles.backImage}
          />
          <View style={styles.overview}>
            <TouchableOpacity>
              <ShockAvatar
                height={133}
                image={avatar}
                onPress={this.onPressAvatar}
                lastSeenApp={Date.now()}
                avatarStyle={styles.avatarStyle}
                disableOnlineRing
              />
            </TouchableOpacity>
            <View style={styles.bio}>
              <TouchableOpacity
                onPress={this.toggleSetupDisplayName}
                disabled={displayName === null}
              >
                <Text style={styles.displayNameDark}>
                  {displayName === null ? 'Loading...' : displayName}
                </Text>
              </TouchableOpacity>

              <Pad amount={8} />

              <TouchableOpacity onPress={this.onPressBio}>
                <Text style={styles.bodyTextDark}>{bio || 'Loading...'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.configButtonDark}
                onPress={this.onPressMetaConfigModal}
              >
                <SettingIcon />
                <Text style={styles.configButtonTextDark}>Config</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.mainButtons}>
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
    color: '#F3EFEF',
    fontFamily: 'Montserrat-700',
    fontSize: 16,
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
    marginTop: -30,
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
    flexDirection: 'column',
    marginTop: 50,
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
