/** @format */
import React from 'react'

import {
  Clipboard,
  Text,
  StyleSheet,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native'
import EntypoIcons from 'react-native-vector-icons/Entypo'
import { AirbnbRating } from 'react-native-ratings'

import * as API from '../services/contact-api'
import * as CSS from '../css'
import * as Cache from '../services/cache'
import * as Utils from '../services/utils'
import ShockAvatar from '../components/ShockAvatar'
import QR from './WalletOverview/QR'
import Pad from '../components/Pad'
import BasicDialog from '../components/BasicDialog'
import ShockInput from '../components/ShockInput'
import IGDialogBtn from '../components/IGDialogBtn'

export const MY_PROFILE = 'MY_PROFILE'

const showCopiedToClipboardToast = () => {
  ToastAndroid.show('Copied to clipboard!', 800)
}

/**
 * @typedef {object} State
 * @prop {Cache.AuthData|null} authData
 * @prop {string|null} displayName
 * @prop {boolean} displayNameDialogOpen
 * @prop {string} displayNameInput
 * @prop {string|null} handshakeAddr
 */

/**
 * @augments React.PureComponent<{}, State, never>
 */
export default class MyProfile extends React.PureComponent {
  /**
   * @type {import('react-navigation').NavigationBottomTabScreenOptions}
   */
  static navigationOptions = {
    tabBarIcon: ({ tintColor }) => {
      return ((
        <EntypoIcons
          color={tintColor === null ? undefined : tintColor}
          name="user"
          // reverseColor={'#CED0CE'}
          size={22}
        />
      ))
    },
  }

  /** @type {State} */
  state = {
    authData: null,
    displayName: null,
    displayNameDialogOpen: false,
    displayNameInput: '',
    handshakeAddr: null,
  }

  onDisplayNameUnsub = () => {}

  onHandshakeAddressUnsub = () => {}

  async componentDidMount() {
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

    const authData = await Cache.getStoredAuthData()

    if (authData === null) {
      throw new Error()
    }

    this.setState({
      authData: authData.authData,
    })
  }

  componentWillUnmount() {
    this.onDisplayNameUnsub()
    this.onHandshakeAddressUnsub()
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

  genHandAddr = () => {
    API.Actions.generateNewHandshakeNode()
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

  render() {
    const {
      displayName,
      authData,
      handshakeAddr,
      displayNameInput,
      displayNameDialogOpen,
    } = this.state

    if (authData === null) {
      return <ActivityIndicator size="large" />
    }

    return (
      <React.Fragment>
        <View style={styles.container}>
          <View style={styles.subContainer}>
            <TouchableOpacity>
              <ShockAvatar height={100} image={null} />
            </TouchableOpacity>

            <Pad amount={4} />

            <TouchableOpacity onPress={this.toggleSetupDisplayName}>
              <Text style={styles.displayName}>
                {displayName === null
                  ? Utils.defaultName(authData.publicKey)
                  : displayName}
              </Text>
            </TouchableOpacity>

            <Pad amount={6} />

            <TouchableOpacity>
              <AirbnbRating
                defaultRating={0}
                isDisabled
                showRating={false}
                size={10}
              />
            </TouchableOpacity>

            <Pad amount={8} />

            <TouchableOpacity>
              <Text style={styles.bodyText}>
                Lorem Epsom is simply dummy text for developers and designers
                Lorem.
              </Text>
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
      </React.Fragment>
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
