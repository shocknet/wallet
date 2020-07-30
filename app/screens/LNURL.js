import React from 'react'
import Logger from 'react-native-file-log'
import { Text, View, Switch, StyleSheet, Clipboard } from 'react-native'
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
export const LNURL_SCREEN = 'LNURL_SCREEN'
/**@typedef {{  tag:string,
 *              uri:string,
 *              metadata:string,
 *              callback:string,
 *              minSendable:number,
 *              maxSendable:number,
 *              maxWithdrawable:number,
 *              shockPubKey:string,
 *              k1:string
 *          }} LNURLdataType */
class LNURL extends React.Component {
  localReset = () => {
    this.props.refreshLNURL()
    this.setState(this.getInitialLNURLState())
  }

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
    }
  }
  /**
   * @type {{
   *  privateChannel:boolean
   *  done:boolean|null
   *  error:boolean|null
   *  payAmount:number
   *  withdrawAmount:number
   *  didChange:boolean
   *  hasMemo:boolean
   *  memo:string
   *  LNURLdata:LNURLdataType|null
   * disablePaste:boolean
   * scanQR:boolean
   * }}
   */

  state = this.getInitialLNURLState()

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
        })
      } else {
        this.setState({
          error: json.reason,
        })
      }
    } catch (e) {
      Logger.log(e)
      this.setState({
        error: e.toString(),
      })
    }
  }

  confirmPayReq = async () => {
    try {
      if (this.state.LNURLdata === null) {
        return
      }
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
        })
        return
      }
      Logger.log(json.pr)
      this.props.navigation.navigate(WALLET_OVERVIEW, { lnurlInvoice: json.pr })
      //this.props.requestClose()
      //this.props.payInvoice({ invoice: json.pr })
    } catch (e) {
      Logger.log(e)
      this.setState({
        error: e,
      })
    }
  }

  confirmWithdrawReq = async () => {
    try {
      if (this.state.LNURLdata === null) {
        return
      }
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
        })
      } else {
        this.setState({
          error: json.reason,
        })
      }
    } catch (e) {
      this.setState({
        error: e,
      })
    }
  }

  handleDone() {
    return <Text>{this.state.done}</Text>
  }

  handleError() {
    return <Text>{this.state.error}</Text>
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
      <Text>
        LNURL : Hosted Channel Request - This Request is not supported
      </Text>
    )
  }

  renderAuth = () => {
    return <Text>LNURL : Auth Request - This Request is not supported</Text>
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
    return <Text>LNURL : Unknown Request</Text>
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
   * @param {any} nextProps
   */

  componentWillReceiveProps(nextProps) {
    const p1 = nextProps.navigation.state.params
    const p2 = this.props.navigation.state.params
    if (!p1 || !p2) {
      return
    }
    if (p1.lnurl === p2.lnurl) {
      return
    }
    const params = p1
    this.props.navigation.setParams({ lnurl: undefined })
    this.decodeLNURL(params.lnurl)
  }

  componentDidMount() {
    const { params } = this.props.navigation.state
    if (params && params.lnurl) {
      this.props.navigation.setParams({ lnurl: undefined })
      this.decodeLNURL(params.lnurl)
    }
  }

  /**
   * @param {string} data
   */
  async decodeLNURL(data) {
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
    }
  }

  copyFromClipboard = () => {
    this.setState({ disablePaste: true })
    Clipboard.getString().then(async lnurl => {
      await this.decodeLNURL(lnurl)
    })
  }

  /**
   * @param {{data:string}} e
   */
  onScanQR = e => {
    this.setState({
      scanQR: false,
    })
    this.decodeLNURL(e.data)
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
    const { done, error, LNURLdata, scanQR } = this.state
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
 * @param {typeof import('../../reducers/index').default} state
 */
const mapStateToProps = ({ history }) => ({ history })

const mapDispatchToProps = {}

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
