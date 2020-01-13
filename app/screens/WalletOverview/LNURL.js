import React from 'react'
import ShockModal from '../../components/ShockModal'
import { Text, View } from 'react-native'
/**@typedef {{  tag:string,
 *              uri:string,
 *          }} LNURLdataType */
export default class LNURL extends React.PureComponent {
  /**
   * @const {string} callback
   * @const {string} k1
   * @const {string} nodeId
   * @const {boolean} privateChan
   */
  confirmChannelReq = () => {
    const callback = ''
    const k1 = ''
    const nodeId = ''
    const privateChan = ''
    const priv = privateChan ? 1 : 0
    const completeUrl = `${callback}?k1=${k1}&remoteid=${nodeId}&private=${priv}`
    /*const res = */ fetch(completeUrl)
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
