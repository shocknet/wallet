import React from 'react'
import { View, Text, ToastAndroid, Clipboard } from 'react-native'
import { NavigationEvents } from 'react-navigation'
import { connect } from 'react-redux'
import { StackNavigationOptions } from 'react-navigation-stack/lib/typescript/src/vendor/types'
import * as FS from 'react-native-fs'
import Share from 'react-native-share'

import * as CSS from '../res/css'
import {
  SettingOrData,
  headerStyle,
  headerTitleStyle,
  headerBackImage,
  ScrollViewContainer,
  PAD_BETWEEN_ITEMS,
} from '../components/settings'

import Pad from '../components/Pad'
import * as Store from '../store'
import * as Services from '../services'
import * as Routes from '../routes'

interface OwnProps {}

interface StateProps {
  err?: string
  debugModeEnabled: boolean
}

interface DispatchProps {
  enableDebug(): void
  disableDebug(): void
}

type Props = OwnProps & StateProps & DispatchProps

interface State {
  sharingWalletLog: boolean
  sharingAPILog: boolean
  goingToPubkey: boolean
}

class Debug extends React.PureComponent<Props, State> {
  static navigationOptions: StackNavigationOptions = {
    title: 'Debug',
    headerStyle,
    headerTitleAlign: 'center',
    headerTitleStyle,
    headerBackImage,
  }

  state: State = {
    sharingAPILog: false,
    sharingWalletLog: false,
    goingToPubkey: false,
  }

  mounted = false

  componentDidMount() {
    this.mounted = true
  }

  componentWillUnmount() {
    this.mounted = false
  }

  disableDebugMode = () => {
    this.props.disableDebug()
  }

  toggleDebugMode = () => {
    if (this.props.debugModeEnabled) {
      this.disableDebugMode()
    } else {
      this.props.enableDebug()
    }
  }

  shareWalletLog = async () => {
    ToastAndroid.show('Coming soon', ToastAndroid.LONG)
    // try {
    //   this.setState({
    //     sharingWalletLog: true,
    //   })

    //   console.log('beforeeee')

    //   const files = await Logger.listAllLogFiles()

    //   console.log(files)

    //   this.setState({
    //     sharingWalletLog: false,
    //   })
    // } catch (e) {}
  }

  goToPubkey = async () => {
    try {
      this.setState({
        goingToPubkey: true,
      })

      const params: Routes.UserParams = {
        publicKey: await Clipboard.getString(),
      }

      if (!this.mounted) {
        return
      }

      this.setState({
        goingToPubkey: false,
      })

      Services.navigate(Routes.USER, params)
    } catch (e) {
      ToastAndroid.show(e.message, ToastAndroid.LONG)
    }
  }

  shareAPILog = async () => {
    try {
      this.setState({
        sharingAPILog: true,
      })

      interface Res {
        dailyRotateFile: Array<{
          message: string
          level: string
        }>
      }

      const { dailyRotateFile: lines } = await Services.get<Res>('api/log')

      const path = FS.DocumentDirectoryPath + '/shock-api-log-export.txt'

      const txt = lines.map(l => JSON.stringify(l)).join('\n')

      FS.writeFile(path, txt)

      Share.open({
        type: 'plain/text',
        url: 'file://' + path,
      })

      this.setState({
        sharingAPILog: false,
      })
    } catch (e) {
      ToastAndroid.show(
        `Could not share API log: ${e.message}`,
        ToastAndroid.LONG,
      )
    }
  }

  dismissSpinners = () => {
    this.setState({
      sharingAPILog: false,
      sharingWalletLog: false,
      goingToPubkey: false,
    })
  }

  render() {
    const { err, debugModeEnabled } = this.props
    const { sharingAPILog, sharingWalletLog, goingToPubkey } = this.state

    if (err) {
      return (
        <View style={CSS.styles.flexDeadCenter}>
          <Text>{err}</Text>
        </View>
      )
    }

    return (
      <>
        <NavigationEvents onDidBlur={this.dismissSpinners} />

        <ScrollViewContainer>
          <SettingOrData
            onPress={this.toggleDebugMode}
            title="Debug Mode Enabled"
            subtitle="Logs become more verbose"
            rightSide={
              debugModeEnabled ? 'checkbox-active' : 'checkbox-passive'
            }
          />

          <Pad amount={PAD_BETWEEN_ITEMS} />

          <SettingOrData
            onPress={this.shareWalletLog}
            title="Share Log"
            subtitle="Share as text file"
            rightSide={sharingWalletLog ? 'spinner' : 'copy'}
          />

          <Pad amount={PAD_BETWEEN_ITEMS} />

          <SettingOrData
            onPress={this.shareAPILog}
            title="Share API Log"
            subtitle="Downloads logs for the last hour from node and shares as text file"
            rightSide={sharingAPILog ? 'spinner' : 'copy'}
          />

          <Pad amount={PAD_BETWEEN_ITEMS} />

          <SettingOrData
            onPress={this.goToPubkey}
            title="Go to public key"
            subtitle="Visits profile of public key found in clipboard"
            rightSide={goingToPubkey ? 'spinner' : undefined}
          />
        </ScrollViewContainer>
      </>
    )
  }
}

const mapStateToProps = (state: Store.State): StateProps => {
  try {
    return {
      debugModeEnabled: state.debug.enabled,
    }
  } catch (e) {
    // @ts-expect-error
    return {
      err: e.message,
    }
  }
}

const mapDispatch = {
  disableDebug: Store.disableDebug,
  enableDebug: Store.enableDebug,
}

export default connect(
  mapStateToProps,
  mapDispatch,
)(Debug)
