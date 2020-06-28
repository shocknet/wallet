import React from 'react'
import {
  Clipboard,
  Text,
  StyleSheet,
  ToastAndroid,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native'
import moment from 'moment'
import { connect } from 'react-redux'
import { Schema } from 'shock-common'
import { NavigationScreenProp, NavigationScreenOptions } from 'react-navigation'

type Navigation = NavigationScreenProp<{}, Routes.UserParams>

import { SET_LAST_SEEN_APP_INTERVAL } from '../../services/utils'
import * as CSS from '../../res/css'
import { ConnectedShockAvatar } from '../../components/ShockAvatar'
import QR from '../WalletOverview/QR'
import Pad from '../../components/Pad'
import * as Reducers from '../../../reducers'
import * as Routes from '../../routes'
import { SafeAreaView } from 'react-navigation'
import FollowBtn from '../../components/FollowBtn'

type UserType = Schema.User

interface ConnectedProps {
  users: UserType[]
}

export interface Props extends ConnectedProps {
  navigation: Navigation
}

const showCopiedToClipboardToast = () => {
  ToastAndroid.show('Copied to clipboard!', 800)
}

class User extends React.Component<Props> {
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

  componentDidMount() {
    this.intervalID = setInterval(() => {
      this.forceUpdate()
    }, SET_LAST_SEEN_APP_INTERVAL)
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

  render() {
    const { displayName, lastSeenApp, publicKey } = this.getUser()

    return (
      <SafeAreaView>
        <ScrollView contentContainerStyle={styles.container}>
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

          <FollowBtn publicKey={publicKey} />
        </ScrollView>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = (state: Reducers.State): ConnectedProps => {
  //  TODO: find out a way to get a single user here
  const users = Reducers.selectAllUsers(state)
  const usersArr = Object.values(users) as Schema.User[]

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

    paddingBottom: 20,
    paddingTop: 20,
  },

  subContainer: {
    alignItems: 'center',
  },
})
