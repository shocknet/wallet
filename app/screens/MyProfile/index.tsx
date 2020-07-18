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
import { CREATE_POST } from '../../screens/CreatePost'

import SetBioDialog from './SetBioDialog'

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
}

interface Sentinel {
  type: '@@Sentinel'
}

type Item = Sentinel | Common.Schema.Post

export default class MyProfile extends React.Component<Props, State> {
  static navigationOptions: NavigationBottomTabScreenOptions = {
    tabBarIcon: ({ focused }) => {
      return (
        <FontAwesome5
          color={
            focused ? CSS.Colors.BLUE_MEDIUM_DARK : CSS.Colors.GRAY_MEDIUM_LIGHT
          }
          name="user-circle"
          // reverseColor={'#CED0CE'}
          size={32}
        />
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
      StatusBar.setBackgroundColor(CSS.Colors.BACKGROUND_WHITE)
      StatusBar.setBarStyle('dark-content')
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
          images={images}
          paragraphs={paragraphhs}
          // @ts-expect-error
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
            <Text style={styles.bodyText}>
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

  render() {
    const { settingAvatar, settingBio, settingDisplayName } = this.state

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

  createBtn: {
    height: 60,
    width: 60,
    borderRadius: 30,
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

  container: {
    alignItems: 'center',
    backgroundColor: CSS.Colors.TEXT_WHITE,
    flex: 1,
  },

  subContainer: {
    alignItems: 'center',
  },
})
