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
} from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
// import { AirbnbRating } from 'react-native-ratings'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}>} Navigation
 */

import * as API from '../../services/contact-api'
import * as CSS from '../../res/css'
import * as Cache from '../../services/cache'
import * as Utils from '../../services/utils'
import ShockAvatar from '../../components/ShockAvatar'
import QR from '../WalletOverview/QR'
import Pad from '../../components/Pad'
import BasicDialog from '../../components/BasicDialog'
import ShockInput from '../../components/ShockInput'
import IGDialogBtn from '../../components/IGDialogBtn'

import SetBioDialog from './SetBioDialog'

export const MY_PROFILE = 'MY_PROFILE'

const showCopiedToClipboardToast = () => {
  ToastAndroid.show('Copied to clipboard!', 800)
}

/**
 * @typedef {object} State
 * @prop {Cache.AuthData|null} authData
 * @prop {string|null} avatar
 * @prop {string|null} displayName
 * @prop {boolean} displayNameDialogOpen
 * @prop {string} displayNameInput
 * @prop {string|null} handshakeAddr
 * @prop {string|null} bio
 */

/**
 * @augments React.PureComponent<{ navigation: Navigation }, State, never>
 */
export default class MyProfile extends React.PureComponent {
  /**
   * @type {import('react-navigation').NavigationBottomTabScreenOptions}
   */
  static navigationOptions = {
    tabBarIcon: ({ focused }) => {
      return ((
        <FontAwesome5
          color={
            focused ? CSS.Colors.BLUE_MEDIUM_DARK : CSS.Colors.GRAY_MEDIUM_LIGHT
          }
          name="user-circle"
          // reverseColor={'#CED0CE'}
          size={32}
        />
      ))
    },
  }

  /** @type {State} */
  state = {
    authData: null,
    avatar: null,
    displayName: null,
    displayNameDialogOpen: false,
    displayNameInput: '',
    handshakeAddr: null,
    bio: API.Events.currentBio,
  }

  /**
   * @type {React.RefObject<SetBioDialog>}
   */
  setBioDialog = React.createRef()

  onAvatarUnsub = () => {}

  onDisplayNameUnsub = () => {}

  onHandshakeAddressUnsub = () => {}

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
    this.onHandshakeAddressUnsub = API.Events.onHandshakeAddr(addr => {
      this.setState({
        handshakeAddr: addr,
      })
    })
    this.onAvatarUnsub = API.Events.onAvatar(avatar => {
      this.setState({ avatar })
    })
    this.onBioUnsub = API.Events.onBio(bio => this.setState({ bio }))

    const authData = await Cache.getStoredAuthData()

    if (authData === null) {
      throw new Error()
    }

    this.setState({
      authData: authData.authData,
    })
  }

  componentWillUnmount() {
    this.didFocus.remove()
    this.onDisplayNameUnsub()
    this.onHandshakeAddressUnsub()
    this.onAvatarUnsub()
    this.onBioUnsub()
  }

  /**
   * @param {string} dn
   */
  onChangeDisplayNameInput = dn => {
    this.setState({
      displayNameInput: dn,
    })
  }

  toggleSetupDisplayName = () => {
    this.setState(({ displayNameDialogOpen }) => ({
      displayNameDialogOpen: !displayNameDialogOpen,
      displayNameInput: '',
    }))
  }

  setDisplayName = () => {
    API.Actions.setDisplayName(this.state.displayNameInput)
    this.toggleSetupDisplayName()
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

  onPressAvatar = () => {
    const AVATAR_EDGE = 640
    ImagePicker.openPicker({
      cropping: true,
      width: AVATAR_EDGE,
      height: AVATAR_EDGE,
      multiple: false,
      includeBase64: true,
      cropperCircleOverlay: true,
      useFrontCamera: true,
      compressImageMaxWidth: AVATAR_EDGE,
      compressImageMaxHeight: AVATAR_EDGE,
      mediaType: 'photo',
    })
      .then(image => {
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

        this.setState({ avatar: image.data })

        API.Actions.setAvatar(image.data)
      })
      .catch(e => {
        console.warn(e.message)
      })
  }

  onPressBio = () => {
    const { current } = this.setBioDialog

    current && current.open()
  }

  /**
   * @param {string} bio
   */
  onSubmitBio = bio => {
    this.setState({ bio })

    API.Actions.setBio(bio)
  }

  render() {
    const {
      displayName,
      authData,
      avatar,
      handshakeAddr,
      displayNameInput,
      displayNameDialogOpen,
      bio,
    } = this.state

    if (authData === null) {
      return <ActivityIndicator size="large" />
    }

    return (
      <>
        <View style={styles.container}>
          <View style={styles.subContainer}>
            <TouchableOpacity>
              <ShockAvatar
                height={100}
                image={avatar}
                onPress={this.onPressAvatar}
              />
            </TouchableOpacity>

            <Pad amount={4} />

            <TouchableOpacity onPress={this.toggleSetupDisplayName}>
              <Text style={styles.displayName}>
                {displayName === null
                  ? Utils.defaultName(authData.publicKey)
                  : displayName}
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
              <Text style={styles.bodyText}>{bio || 'ShockWallet User'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.subContainer}>
            {handshakeAddr !== null && (
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
            )}
          </View>
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
    justifyContent: 'space-around',
    paddingBottom: 20,
    paddingTop: 20,
  },

  subContainer: {
    alignItems: 'center',
  },
})
