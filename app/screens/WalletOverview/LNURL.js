import React from 'react'
import ShockModal from '../../components/ShockModal'
import { Text, View } from 'react-native'
import { nodeInfo, addPeer } from '../../services/wallet'
import { Button, CheckBox } from 'react-native-elements'
/**@typedef {{  tag:string,
 *              uri:string,
 *          }} LNURLdataType */
export default class LNURL extends React.PureComponent {
  /**@param {object} props */
  constructor(props) {
    super(props)
    this.state = {
      private: false,
      public: true,
    }
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
      const connect = await addPeer(uri)
      console.log('connect')
      console.log(connect)
      const node = await nodeInfo()
      console.log(node)

      const nodeId = node.identity_pubkey
      const privateChan = ''
      const priv = privateChan ? 1 : 0
      const completeUrl = `${callback}?k1=${k1}&remoteid=${nodeId}&private=${priv}`
      console.log(completeUrl)
      /*const res = */ // fetch(completeUrl)
    } catch (e) {
      console.log(e)
    }
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
        return this.renderHostedChannelRequest(LNURLdata)
      }
      case 'login': {
        console.log('this url is a login ')
        return this.renderAuth(LNURLdata)
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
        <Button onPress={this.confirmChannelReq} title="yo" />
      </View>
    )
  }

  /**@param   {LNURLdataType} LNURLdata*/
  renderHostedChannelRequest = LNURLdata => {
    return <Text>LNURL : Hosted Channel Request {LNURLdata}</Text>
  }

  /**@param   {LNURLdataType} LNURLdata*/
  renderAuth = LNURLdata => {
    return <Text>LNURL : Auth Request {LNURLdata}</Text>
  }

  /**@param   {LNURLdataType} LNURLdata*/
  renderWithdraw = LNURLdata => {
    return <Text>LNURL : Withdraw Request {LNURLdata}</Text>
  }

  /**@param   {LNURLdataType} LNURLdata*/
  renderPay = LNURLdata => {
    return <Text>LNURL : Pay Request {LNURLdata}</Text>
  }

  renderUnknown = () => {
    return <Text>LNURL : Unknown Request</Text>
  }

  render() {
    const visible = this.props.LNURLdata !== null
    if (visible === false) {
      return null
    }
    return (
      <ShockModal visible={visible} onRequestClose={this.props.requestClose}>
        {this.handleUrl(this.props.LNURLdata)}
      </ShockModal>
    )
  }
}
