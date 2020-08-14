import React, { Component } from 'react'
import Logger from 'react-native-file-log'
import {
  Text,
  View,
  Switch,
  StyleSheet,
  Clipboard,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native'
import { nodeInfo, addPeer, addInvoice } from '../services/wallet'
import ShockButton from '../components/ShockButton'
import ShockInput from '../components/ShockInput'
import Pad from '../components/Pad'
import * as CSS from '../res/css'
//@ts-ignore
import bech32 from 'bech32'
import { connect } from 'react-redux'
import * as Cache from '../services/cache'
import { WALLET_OVERVIEW } from './WalletOverview'
import QRCodeScanner from '../components/QRScanner'
import { fetchPeers } from '../actions/HistoryActions'
import ExtractInfo from '../services/validators'
import { SEND_SCREEN } from './Send'
export const LNURL_SCREEN = 'LNURL_SCREEN'
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
 * @typedef {import('../actions/ChatActions').BTCAddress} BTCAddress
 * @typedef {import('../actions/ChatActions').Contact} Contact
 * @typedef {import('../actions/ChatActions').Keysend} Keysend
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
 * @prop {import('../../reducers/HistoryReducer').State} history
 * @prop {()=>void} fetchPeers
 * @prop {(req:string)=>void} decodePaymentRequest
 * @prop {(contact:Contact|BTCAddress|Keysend)=>void} selectContact
 */
/**
 * @extends Component<Props, State, never>
 */
class LNURL extends React.Component {
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

  /**@param {string} text */
  setWithdrawAmount = text => {
    this.setState({
      withdrawAmount: Number(text),
      didChange: true,
    })
  }

  /**@param {string} text */
  setPayAmount = text => {
    this.setState({
      payAmount: Number(text),
      didChange: true,
    })
  }

  /**@param {boolean} bool*/
  setPrivate = bool => {
    this.setState({
      privateChannel: bool,
    })
  }

  /**@param {boolean} bool*/
  setHasMemo = bool => {
    this.setState({
      hasMemo: bool,
    })
  }

  /**@param {string} text */
  setMemo = text => {
    this.setState({
      memo: text,
    })
  }

  /**
   * @const {string} callback
   * @const {string} k1
   * @const {string} nodeId
   * @const {boolean} privateChan
   */
  confirmChannelReq = async () => {
    if (this.state.LNURLdata === null) {
      return
    }
    this.setState({ loading: true })
    const { uri, callback, k1 } = this.state.LNURLdata
    let newK1 = k1
    if (k1 === 'gun' && this.state.LNURLdata.shockPubKey) {
      newK1 = `$$__SHOCKWALLET__USER__${this.state.LNURLdata.shockPubKey}`
    }
    /**
     *
     * @param {{pub_key:string,address:string}} e
     */
    const samePeer = e => {
      const localUri = `${e.pub_key}@${e.address}`
      return localUri === uri
    }
    if (this.props.history.peers.length === 0) {
      await this.props.fetchPeers()
    }
    try {
      const alreadyPeer = this.props.history.peers.find(samePeer)
      if (!alreadyPeer) {
        await addPeer(uri)
      }
      const node = await nodeInfo()
      //Logger.log(node)

      const nodeId = node.identity_pubkey
      const priv = this.state.privateChannel ? 1 : 0
      const completeUrl = `${callback}?k1=${newK1}&remoteid=${nodeId}&private=${priv}`
      Logger.log(completeUrl)
      const res = await fetch(completeUrl)
      const json = await res.json()
      Logger.log(json)
      if (json.status === 'OK') {
        this.setState({
          done: 'Channel request sent correctly',
          loading: false,
        })
      } else {
        this.setState({
          error: json.reason,
          loading: false,
        })
      }
    } catch (e) {
      Logger.log(e)
      this.setState({
        error: e.toString(),
        loading: false,
      })
    }
  }

  confirmPayReq = async () => {
    try {
      if (this.state.LNURLdata === null) {
        return
      }
      this.setState({ loading: true })
      const { callback } = this.state.LNURLdata
      const { payAmount } = this.state
      const completeUrl = `${callback}?amount=${payAmount * 1000}`
      Logger.log(completeUrl)
      const res = await fetch(completeUrl)
      const json = await res.json()
      Logger.log(json)
      if (json.status === 'ERROR') {
        this.setState({
          error: json.reason,
          loading: false,
        })
        return
      }
      this.setState({ loading: false })
      Logger.log(json.pr)
      this.props.navigation.navigate(SEND_SCREEN, {
        isRedirect: true,
        data: { type: 'ln', request: json.pr },
      })
      //this.props.requestClose()
      //this.props.payInvoice({ invoice: json.pr })
    } catch (e) {
      Logger.log(e)
      this.setState({
        error: e,
        loading: false,
      })
    }
  }

  confirmWithdrawReq = async () => {
    try {
      if (this.state.LNURLdata === null) {
        return
      }
      this.setState({ loading: true })
      const { callback, k1 } = this.state.LNURLdata
      const payReq = await addInvoice({
        value: this.state.withdrawAmount,
        memo: this.state.memo,
        expiry: 1800,
      })
      const completeUrl = `${callback}?k1=${k1}&pr=${payReq.payment_request}`
      Logger.log(completeUrl)
      const res = await fetch(completeUrl)
      const json = await res.json()
      Logger.log(json)
      if (json.status === 'OK') {
        this.setState({
          done: 'Withdraw request sent correctly',
          loading: false,
        })
      } else {
        this.setState({
          error: json.reason,
          loading: false,
        })
      }
    } catch (e) {
      this.setState({
        error: e,
        loading: false,
      })
    }
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
      case 'channelRequest': {
        Logger.log('this url is a channel request')
        return this.renderChannelRequest(LNURLdata)
      }
      case 'withdrawRequest': {
        Logger.log('this url is a withdrawal request')
        return this.renderWithdraw(LNURLdata)
      }
      case 'hostedChannelRequest': {
        Logger.log('this url is a hosted channel request')
        return this.renderHostedChannelRequest()
      }
      case 'login': {
        Logger.log('this url is a login ')
        return this.renderAuth()
      }
      case 'payRequest': {
        Logger.log('this url is a pay request')
        return this.renderPay(LNURLdata)
      }
      default: {
        Logger.log('unknown tag')
        return this.renderUnknown()
      }
    }
  }

  /**@param   {LNURLdataType} LNURLdata*/
  renderChannelRequest = LNURLdata => {
    const { privateChannel } = this.state
    return (
      <View>
        <Text style={styles.bigBold}>LNURL Channel Request</Text>
        <Pad amount={10} />
        <Text style={styles.selfCenter}>Requesting channel from:</Text>
        <Text style={styles.centerBold}>
          {LNURLdata.uri ? LNURLdata.uri : 'ADDRESS NOT FOUND'}
        </Text>
        <View style={styles.switch}>
          <Text>Private Channel</Text>
          <Switch value={privateChannel} onValueChange={this.setPrivate} />
        </View>
        <Pad amount={10} />
        <ShockButton onPress={this.confirmChannelReq} title="CONNECT" />
      </View>
    )
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

  /**@param   {LNURLdataType} LNURLdata*/
  renderWithdraw = LNURLdata => {
    const { withdrawAmount, didChange, hasMemo, memo } = this.state
    let withdrawal = withdrawAmount
    if (!didChange) {
      withdrawal = LNURLdata.maxWithdrawable / 1000
    }
    return (
      <View>
        <Text style={styles.bigBold}>LNURL Withdraw Request </Text>
        <Pad amount={10} />
        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>Max</Text> Withdrawable:
        </Text>
        <Text style={styles.selfCenter}>
          {' '}
          <Text style={CSS.styles.textBold}>
            {LNURLdata.maxWithdrawable / 1000}
          </Text>{' '}
          Satoshi
        </Text>
        <Pad amount={10} />
        <ShockInput
          keyboardType="numeric"
          onChangeText={this.setWithdrawAmount}
          value={withdrawal.toString()}
        />
        <View style={styles.switch}>
          <Text>add Memo</Text>
          <Switch value={hasMemo} onValueChange={this.setHasMemo} />
        </View>
        {hasMemo && (
          <ShockInput onChangeText={this.setMemo} value={memo} multiline />
        )}
        <Pad amount={10} />
        <ShockButton onPress={this.confirmWithdrawReq} title="RECEIVE" />
      </View>
    )
  }

  /**@param   {LNURLdataType} LNURLdata*/
  renderPay = LNURLdata => {
    const { payAmount, didChange } = this.state
    let pay = payAmount
    if (!didChange && LNURLdata.minSendable === LNURLdata.maxSendable) {
      pay = LNURLdata.minSendable / 1000
    }
    //const hostname = new URL(LNURLdata.callback).hostname
    return (
      <View>
        <Text style={styles.bigBold}>LNURL Pay Request </Text>
        <Pad amount={10} />
        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>Min </Text>
          Sendable :
        </Text>
        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>
            {LNURLdata.minSendable / 1000}{' '}
          </Text>
          Satoshi
        </Text>
        <Pad amount={10} />

        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>Max </Text>
          Sendable :
        </Text>
        <Text style={styles.selfCenter}>
          <Text style={CSS.styles.textBold}>
            {LNURLdata.maxSendable / 1000}{' '}
          </Text>
          Satoshi
        </Text>

        <Pad amount={10} />

        <ShockInput
          keyboardType="numeric"
          onChangeText={this.setPayAmount}
          value={pay.toString()}
        />

        <Pad amount={10} />
        <ShockButton onPress={this.confirmPayReq} title="SEND" />
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
   * @param {{data:string}} e
   */
  onScanQR = e => {
    this.setState({
      scanQR: false,
    })
    this.decodeAll(e.data)
  }

  scanQR = () => {
    this.setState({
      scanQR: true,
    })
  }

  closeScanQR = () => {
    this.setState({
      scanQR: false,
    })
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
        <QRCodeScanner
          onRead={this.onScanQR}
          onRequestClose={this.closeScanQR}
        />
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
 * @param {{history:import('../../reducers/HistoryReducer').State}} state
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
  selfCenter: {
    alignSelf: 'center',
  },
  flexCenter: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switch: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerBold: {
    alignSelf: 'center',
    fontWeight: 'bold',
  },
})
