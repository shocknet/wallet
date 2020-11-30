import React from 'react'
import Logger from 'react-native-file-log'
import {
  Text,
  View,
  StyleSheet,
  Clipboard,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native'
import ShockButton from '../components/ShockButton'
import Pad from '../components/Pad'
import * as CSS from '../res/css'
//@ts-expect-error
import bech32 from 'bech32'
import { connect } from 'react-redux'
import * as Cache from '../services/cache'
import { WALLET_OVERVIEW, SEND_SCREEN, ADVANCED_SCREEN } from '../routes'
import QRScanner from './QRScanner'
import { fetchPeers } from '../store/actions/HistoryActions'
import ExtractInfo from '../services/validators'
/**
 * @typedef {object} Params
 * @prop {string=} lnurl
 * @prop {string=} protocol_link
 * @prop {boolean=} qrRequest
 * @prop {boolean=} clipboardRequest
 */
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, Params>} Navigation
 */
/**
 * @typedef {import('../store/actions/ChatActions').BTCAddress} BTCAddress
 * @typedef {import('../store/actions/ChatActions').Contact} Contact
 * @typedef {import('../store/actions/ChatActions').Keysend} Keysend
 */

/**
 * @typedef {object} LNURLdataType
 * @prop {string} tag
 * @prop {string} uri
 * @prop {string} metadata
 * @prop {string} callback
 * @prop {number} minSendable
 * @prop {number} maxSendable
 * @prop {number} maxWithdrawable
 * @prop {string} shockPubKey
 * @prop {string} k1
 * */

/**
 * @typedef {object} State
 * @prop {boolean} privateChannel
 * @prop {string|null} done
 * @prop {string|null} error
 * @prop {number} payAmount
 * @prop {number} withdrawAmount
 * @prop {boolean} didChange
 * @prop {boolean} hasMemo
 * @prop {string} memo
 * @prop {LNURLdataType|null} LNURLdata
 * @prop {boolean} disablePaste
 * @prop {boolean} scanQR
 * @prop {boolean} loading
 */

/**
 * @typedef {object} Props
 * @prop {Navigation} navigation
 * @prop {import('../store/reducers/HistoryReducer').State} history
 * @prop {()=>void} fetchPeers
 * @prop {(req:string)=>void} decodePaymentRequest
 * @prop {(contact:Contact|BTCAddress|Keysend)=>void} selectContact
 */
/**
 * @extends React.PureComponent<Props, State, never>
 */
class LNURL extends React.PureComponent {
  getInitialLNURLState = () => {
    return {
      privateChannel: true,
      done: null,
      error: null,
      payAmount: 0,
      withdrawAmount: 0,
      didChange: false,
      hasMemo: false,
      memo: '',
      LNURLdata: null,
      disablePaste: false,
      scanQR: false,
      loading: false,
    }
  }

  /**@type {State} */
  state = this.getInitialLNURLState()

  backToOverview = () => {
    this.props.navigation.navigate(WALLET_OVERVIEW)
  }

  handleDone() {
    return (
      <View style={styles.flexCenter}>
        <Text>{this.state.done}</Text>
        <Pad amount={10} />
        <ShockButton title="OK" onPress={this.backToOverview} />
      </View>
    )
  }

  handleError() {
    return (
      <View style={styles.flexCenter}>
        <Text>{this.state.error}</Text>
        <Pad amount={10} />
        <ShockButton title="Back" onPress={this.backToOverview} />
      </View>
    )
  }

  /**@param   {LNURLdataType | null} LNURLdata*/
  handleUrl = LNURLdata => {
    if (LNURLdata === null) {
      return this.renderEmpty()
    }
    switch (LNURLdata.tag) {
      case 'hostedChannelRequest': {
        Logger.log('this url is a hosted channel request')
        return this.renderHostedChannelRequest()
      }
      case 'login': {
        Logger.log('this url is a login ')
        return this.renderAuth()
      }
      default: {
        Logger.log('unknown tag')
        return this.renderUnknown()
      }
    }
  }

  renderHostedChannelRequest = () => {
    return (
      <View style={styles.flexCenter}>
        <Text>
          LNURL : Hosted Channel Request - This Request is not supported
        </Text>
        <Pad amount={10} />
        <ShockButton title="Back" onPress={this.backToOverview} />
      </View>
    )
  }

  renderAuth = () => {
    return (
      <View style={styles.flexCenter}>
        <Text>LNURL : Auth Request - This Request is not supported</Text>
        <Pad amount={10} />
        <ShockButton title="Back" onPress={this.backToOverview} />
      </View>
    )
  }

  renderUnknown = () => {
    return (
      <View style={styles.flexCenter}>
        <Text>LNURL : Unknown Request</Text>
        <Pad amount={10} />
        <ShockButton title="Back" onPress={this.backToOverview} />
      </View>
    )
  }

  renderEmpty = () => {
    return (
      <View>
        <Text style={styles.bigBold}>LNURL</Text>
        <Pad amount={10} />
        <ShockButton
          disabled={this.state.disablePaste}
          title="ScanQR"
          onPress={this.scanQR}
        />
        <Pad amount={10} />
        <ShockButton
          disabled={this.state.disablePaste}
          title="Paste from clipboard"
          onPress={this.copyFromClipboard}
        />
      </View>
    )
  }

  /**
   *
   * @param {Props} prevProps
   */
  componentDidUpdate(prevProps) {
    const p1 = this.props.navigation.state.params
    const p2 = prevProps.navigation.state.params
    if (!p1 || !p2) {
      return
    }
    if (p1.protocol_link !== p2.protocol_link) {
      const params = p1
      this.props.navigation.setParams({ protocol_link: undefined })
      if (params.protocol_link) {
        this.decodeAll(params.protocol_link)
      }
      return
    }
    if (p1.lnurl !== p2.lnurl) {
      const params = p1
      this.props.navigation.setParams({ lnurl: undefined })
      if (params.lnurl) {
        this.decodeLNURL(params.lnurl)
      }
      return
    }
    if (p1.qrRequest !== p2.qrRequest) {
      if (p1.qrRequest) {
        this.props.navigation.setParams({ qrRequest: undefined })
        this.scanQR()
        return
      }
    }
    if (p1.clipboardRequest !== p2.clipboardRequest) {
      if (p1.clipboardRequest) {
        this.props.navigation.setParams({ clipboardRequest: undefined })
        this.copyFromClipboard()
      }
    }
  }

  componentDidMount() {
    const { params } = this.props.navigation.state
    if (params && params.protocol_link) {
      this.props.navigation.setParams({ protocol_link: undefined })
      this.decodeAll(params.protocol_link)
      return
    }
    if (params && params.lnurl) {
      this.props.navigation.setParams({ lnurl: undefined })
      this.decodeLNURL(params.lnurl)
      return
    }
    if (params && params.qrRequest) {
      this.props.navigation.setParams({ qrRequest: undefined })
      this.scanQR()
      return
    }
    if (params && params.clipboardRequest) {
      this.props.navigation.setParams({ clipboardRequest: undefined })
      this.copyFromClipboard()
    }
  }

  /**
   *
   * @param {string} data
   */
  decodeAll(data) {
    const info = ExtractInfo(data)
    const { navigation } = this.props
    switch (info.type) {
      case 'btc':
      case 'ln':
      case 'keysend': {
        navigation.navigate(SEND_SCREEN, {
          isRedirect: true,
          data: info,
        })
        return
      }
      case 'pk': {
        ToastAndroid.show('Unimplemented', 800)
        return
      }
      case 'lnurl': {
        this.decodeLNURL(info.lnurl)
        return
      }
      case 'unknown': {
        this.setState({
          error: 'cant decode' + JSON.stringify(info),
        })
      }
    }
  }

  /**
   * @param {string} data
   */
  async decodeLNURL(data) {
    this.setState({ loading: true })
    let lnurl = data
    Logger.log(lnurl)
    const isClean = lnurl.split(':')
    const hasHttp = lnurl.startsWith('http')
    const startLnurl = lnurl.startsWith('LNURL')
    if (startLnurl) {
      const decodedBytes = bech32.fromWords(bech32.decode(lnurl, 1500).words)
      lnurl = String.fromCharCode(...decodedBytes)
    }
    if (!hasHttp && isClean.length === 2) {
      const decodedBytes = bech32.fromWords(
        bech32.decode(isClean[1], 1500).words,
      )
      lnurl = String.fromCharCode(...decodedBytes)
    }
    try {
      const res = await fetch(lnurl)
      const json = await res.json()

      const authData = await Cache.getStoredAuthData()

      json.shockPubKey = authData?.authData.publicKey
      //Logger.log(json)
      if (json.tag === 'channelRequest') {
        this.props.navigation.navigate(ADVANCED_SCREEN, { LNURLChannel: json })
        this.setState(this.getInitialLNURLState)
        return
      }
      if (json.tag === 'withdrawRequest') {
        this.props.navigation.navigate(ADVANCED_SCREEN, { LNURLWithdraw: json })
        this.setState(this.getInitialLNURLState)
        return
      }
      if (json.tag === 'payRequest') {
        this.props.navigation.navigate(SEND_SCREEN, { LNURLPay: json })
        this.setState(this.getInitialLNURLState)
        return
      }
      this.setState({
        LNURLdata: json,
        disablePaste: false,
        loading: false,
      })

      switch (json.tag) {
        case 'channelRequest': {
          Logger.log('this url is a channel request')
          break
        }
        case 'withdrawRequest': {
          Logger.log('this url is a withdrawal request')
          break
        }
        case 'hostedChannelRequest': {
          Logger.log('this url is a hosted channel request')
          break
        }
        case 'login': {
          Logger.log('this url is a login ')
          break
        }
        case 'payRequest': {
          Logger.log('this url is a pay request')
          break
        }
        default: {
          Logger.log('unknown tag')
        }
      }
    } catch (e) {
      Logger.log(e)
      this.setState({
        loading: false,
        error: e,
      })
    }
  }

  copyFromClipboard = () => {
    this.setState({ disablePaste: true })
    Clipboard.getString().then(async lnurl => {
      ToastAndroid.show('Pasted!', 800)
      await this.decodeAll(lnurl)
    })
  }

  /**
   * @param {string} data
   */
  onScanQR = data => {
    this.setState({
      scanQR: false,
    })

    this.decodeAll(data)
  }

  scanQR = () => {
    this.setState({
      scanQR: true,
    })
  }

  toggleScanQR = () => {
    this.setState({
      scanQR: false,
    })
    this.props.navigation.navigate(WALLET_OVERVIEW)
  }

  render() {
    const { done, error, LNURLdata, scanQR, loading } = this.state
    if (loading) {
      return (
        <View style={styles.flexCenter}>
          <ActivityIndicator />
        </View>
      )
    }
    if (scanQR) {
      return (
        <View style={CSS.styles.flex}>
          <QRScanner
            onQRSuccess={this.onScanQR}
            toggleQRScreen={this.toggleScanQR}
            type="send"
          />
        </View>
      )
    }
    return (
      <View style={styles.flexCenter}>
        {done === null && error === null && this.handleUrl(LNURLdata)}
        {done !== null && this.handleDone()}
        {error !== null && this.handleError()}
      </View>
    )
  }
}
/**
 * @param {{history:import('../store/reducers/HistoryReducer').State}} state
 */
const mapStateToProps = ({ history }) => ({ history })

const mapDispatchToProps = {
  fetchPeers,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(LNURL)

const styles = StyleSheet.create({
  bigBold: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  flexCenter: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
