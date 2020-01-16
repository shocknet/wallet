import React from 'react'
import ShockModal from '../../components/ShockModal'
import { Text, View, TextInput } from 'react-native'
import { nodeInfo, addPeer, addInvoice } from '../../services/wallet'
import { Button, CheckBox } from 'react-native-elements'

/**@typedef {{  tag:string,
 *              uri:string,
 *              metadata:string,
 *              callback:string,
 *              minSendable:number,
 *              maxSendable:number,
 *              maxWithdrawable:number
 *          }} LNURLdataType */
export default class LNURL extends React.PureComponent {
  /**@param {object} props */
  constructor(props) {
    super(props)
    this.state = {
      private: false,
      public: true,
      done: null,
      error: null,
      payAmount: 0,
      withdrawAmount: 0,
    }
  }

  /**@param {string} text */
  setWithdrawAmount = text => {
    this.setState({
      withdrawAmount: Number(text),
    })
  }

  /**@param {string} text */
  setPayAmount = text => {
    this.setState({
      payAmount: Number(text),
    })
  }

  setPrivate = () => {
    this.setState({
      private: true,
      public: false,
    })
  }

  setPublic = () => {
    this.setState({
      private: false,
      public: true,
    })
  }

  /**
   * @const {string} callback
   * @const {string} k1
   * @const {string} nodeId
   * @const {boolean} privateChan
   */
  confirmChannelReq = async () => {
    try {
      const { uri, callback, k1 } = this.props.LNURLdata
      await addPeer(uri)
      console.log('connect')
      //console.log(connect)
      const node = await nodeInfo()
      //console.log(node)

      const nodeId = node.identity_pubkey
      const privateChan = ''
      const priv = privateChan ? 1 : 0
      const completeUrl = `${callback}?k1=${k1}&remoteid=${nodeId}&private=${priv}`
      console.log(completeUrl)
      const res = await fetch(completeUrl)
      const json = await res.json()
      console.log(json)
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
      console.log(e)
      this.setState({
        error: e,
      })
    }
  }

  confirmPayReq = async () => {
    try {
      const { callback } = this.props.LNURLdata
      const { payAmount } = this.state
      const completeUrl = `${callback}?amount=${payAmount * 1000}`
      console.log(completeUrl)
      const res = await fetch(completeUrl)
      const json = await res.json()
      console.log(json)
      if (json.status === 'ERROR') {
        this.setState({
          error: json.reason,
        })
        return
      }
      console.log(json.pr)
      this.props.requestClose()
      this.props.payInvoice({ invoice: json.pr })
    } catch (e) {
      console.log(e)
      this.setState({
        error: e,
      })
    }
  }

  confirmWithdrawReq = async () => {
    try {
      const { callback, k1 } = this.props.LNURLdata
      const payReq = await addInvoice({
        value: this.state.withdrawAmount,
        memo: '',
        expiry: 1800,
      })
      const completeUrl = `${callback}?k1=${k1}&pr=${payReq.payment_request}`
      console.log(completeUrl)
      const res = await fetch(completeUrl)
      const json = await res.json()
      console.log(json)
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

  /**@param   {LNURLdataType} LNURLdata*/
  handleUrl = LNURLdata => {
    switch (LNURLdata.tag) {
      case 'channelRequest': {
        console.log('this url is a channel request')
        return this.renderChannelRequest(LNURLdata)
      }
      case 'withdrawRequest': {
        console.log('this url is a withdrawal request')
        return this.renderWithdraw(LNURLdata)
      }
      case 'hostedChannelRequest': {
        console.log('this url is a hosted channel request')
        return this.renderHostedChannelRequest()
      }
      case 'login': {
        console.log('this url is a login ')
        return this.renderAuth()
      }
      case 'payRequest': {
        console.log('this url is a pay request')
        return this.renderPay(LNURLdata)
      }
      default: {
        console.log('unknown tag')
        return this.renderUnknown()
      }
    }
  }

  /**@param   {LNURLdataType} LNURLdata*/
  renderChannelRequest = LNURLdata => {
    return (
      <View>
        <Text>LNURL : Channel Request</Text>
        <Text>Are you sure you want to request a channel from:</Text>
        <Text>{LNURLdata.uri ? LNURLdata.uri : 'ADDRESS NOT FOUND'}</Text>
        <CheckBox
          center
          title="Public Channel"
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          checked={this.state.public}
          onPress={this.setPublic}
        />
        <CheckBox
          center
          title="Private Channel"
          checkedIcon="dot-circle-o"
          uncheckedIcon="circle-o"
          checked={this.state.private}
          onPress={this.setPrivate}
        />
        <Button onPress={this.confirmChannelReq} title="CONFIRM CHANNEL REQ" />
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
    const style = { height: 40, borderColor: 'gray', borderWidth: 1 }
    return (
      <View>
        <Text>LNURL : Withdraw Request </Text>
        <Text>Max Withdrawable: {LNURLdata.maxWithdrawable / 1000}</Text>
        <TextInput
          style={style}
          onChangeText={this.setWithdrawAmount}
          value={this.state.withdrawAmount.toString()}
        />
        <Text>[Memo Input?]</Text>
        <Button
          onPress={this.confirmWithdrawReq}
          title="CONFIRM WITHDRAW REQ"
        />
      </View>
    )
  }

  /**@param   {LNURLdataType} LNURLdata*/
  renderPay = LNURLdata => {
    //console.log(LNURLdata)
    const metadata = JSON.parse(LNURLdata.metadata)
    //const metatdata = LNURLdata.metadata
    console.log(metadata)
    let textContent = ''
    for (let i = 0; i < metadata.length; i += 1) {
      if (metadata[i][0] === 'text/plain') {
        const metaArray = metadata[i]
        const index = 1
        textContent = metaArray[index]
        break
      }
    }
    const style = { height: 40, borderColor: 'gray', borderWidth: 1 }
    //const hostname = new URL(LNURLdata.callback).hostname
    return (
      <View>
        <Text>LNURL : Pay Request </Text>
        <Text>Min Sendable : {LNURLdata.minSendable / 1000} Satoshi</Text>
        <Text>Max Sendable : {LNURLdata.maxSendable / 1000} Satoshi</Text>
        <TextInput
          style={style}
          onChangeText={this.setPayAmount}
          value={this.state.payAmount.toString()}
        />
        <Button onPress={this.confirmPayReq} title="CONFIRM PAY REQ" />
        <Text>{textContent}</Text>
      </View>
    )
  }

  renderUnknown = () => {
    return <Text>LNURL : Unknown Request</Text>
  }

  render() {
    const visible = this.props.LNURLdata !== null
    if (visible === false) {
      return null
    }
    const { done, error } = this.state
    return (
      <ShockModal visible={visible} onRequestClose={this.props.requestClose}>
        {done === null &&
          error === null &&
          this.handleUrl(this.props.LNURLdata)}
        {done !== null && this.handleDone()}
        {error !== null && this.handleError()}
      </ShockModal>
    )
  }
}
