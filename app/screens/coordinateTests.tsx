import React from 'react'
import {
  View,
  Text,
  Clipboard,
  ToastAndroid,
} from 'react-native'
import Http from 'axios'

import * as CSS from '../res/css'
import ShockInput from '../components/ShockInput'
import ShockButton from '../components/ShockButton'
///api/lnd/unifiedTrx
type State = {
  receiverMagnet?:string
  receiverPub?:string
  postID?:string
  spontRes?:string
  tipRes?:string
  revealRes?:string
  seedRes?:string
  loading:boolean
}
type Props = {
  navigation: import('react-navigation').NavigationScreenProp<{}, {}>
}
export default class CoordinateTest extends React.PureComponent<Props, State> {
  state: State = {
    loading:false
  }

  copyToClipboard = (data : string) => {
      Clipboard.setString(data)
      ToastAndroid.show('Copied to clipboard!', 800)
  }

  componentDidMount() {

  }

  componentWillUnmount() {
  }
  createTestPost(){
    if(!this.state.receiverMagnet){
      return
    }
    this.setState({loading:true})
    Http.post('/api/gun/wall/',{
      tags: [],
      title: 'test post',
      contentItems: [{
        type: 'video/embedded',
        magnetURI:this.state.receiverMagnet,
        width:100,
        height:100,
        isPreview:false,
        isPrivate:true
      }],
    }).then(r => {
      const {data,status} = r
      if(status !== 200){
        return
      }
      this.setState({loading:false,postID:data[0]})
    })
    .catch(e => {
      this.setState({loading:false,postID:JSON.stringify(e)})
    })
  }
  sendSpontPayment(){
    if(!this.state.receiverPub){
      return
    }
    this.setState({loading:true})
    Http.post('/api/lnd/unifiedTrx',{
      type: 'spontaneousPayment',
      amt: 100,
      to: this.state.receiverPub,
      memo:'',
      feeLimit:500,
    }).then(r => {
      const {status} = r
      if(status !== 200){
        return
      }
      this.setState({loading:false,spontRes:'ok'})
    })
    .catch(e => {
      this.setState({loading:false,spontRes:JSON.stringify(e)})
    })
  }
  sendTip(){
    if(!this.state.receiverPub || !this.state.postID){
      return
    }
    this.setState({loading:true})
    Http.post('/api/lnd/unifiedTrx',{
      type: 'tip',
      amt: 100,
      to: this.state.receiverPub,
      memo:'',
      feeLimit:500,
      ackInfo:this.state.postID
    }).then(r => {
      const {status} = r
      if(status !== 200){
        return
      }
      this.setState({loading:false,tipRes:'ok'})
    })
    .catch(e => {
      this.setState({loading:false,tipRes:JSON.stringify(e)})
    })
  }
  reveal(){
    if(!this.state.receiverPub || !this.state.postID){
      return
    }
    this.setState({loading:true})
    Http.post('/api/lnd/unifiedTrx',{
      type: 'contentReveal',
      amt: 100,
      to: this.state.receiverPub,
      memo:'',
      feeLimit:500,
      ackInfo:this.state.postID
    }).then(r => {
      const {data,status} = r
      if(status !== 200){
        return
      }
      this.setState({loading:false,revealRes:JSON.stringify(data.orderAck)})
    })
    .catch(e => {
      this.setState({loading:false,revealRes:JSON.stringify(e)})
    })
  }
  seed(){
    if(!this.state.receiverPub){
      return
    }
    this.setState({loading:true})
    Http.post('/api/lnd/unifiedTrx',{
      type: 'torrentSeed',
      amt: 100,
      to: this.state.receiverPub,
      memo:'',
      feeLimit:500,
    }).then(r => {
      const {data,status} = r
      if(status !== 200){
        return
      }
      this.setState({loading:false,seedRes:JSON.stringify(data.orderAck)})
    })
    .catch(e => {
      this.setState({loading:false,seedRes:JSON.stringify(e)})
    })
  }

  render() {
    if(this.state.loading){
      return <View><Text>LOADING:...</Text></View>
    }
    return <View>
      
      <Text style={CSS.styles.fontSize24}>Receiver side</Text>
      <ShockInput
        placeholder='torrent magnet'
        onChangeText={(text:string) => this.setState({receiverMagnet:text})}
        value={this.state.receiverMagnet || ''}
      />
      <ShockButton
        title='create test post'
        onPress={() => this.createTestPost()}
      />
      {this.state.postID && <Text>Post ID: {this.state.postID}</Text>}
      {this.state.postID && <ShockButton title='copy id' onPress={() => this.copyToClipboard(this.state.postID || '')}/>}
      <Text style={CSS.styles.fontSize24}>Sender side</Text>
      <ShockInput
        placeholder='other use pub'
        onChangeText={(text:string) => this.setState({receiverPub:text})}
        value={this.state.receiverPub || ''}
      />
      <ShockButton
        title='send spont payment to pub'
        onPress={() => this.sendSpontPayment()}
      />
      {this.state.spontRes && <Text>Spontaneous payment status:{this.state.spontRes}</Text>}
      <ShockInput
        placeholder='post ID'
        onChangeText={(text:string) => this.setState({postID:text})}
        value={this.state.postID || ''}
      />
      <ShockButton
        title='send tip to post'
        onPress={() => this.sendTip()}
      />
      {this.state.tipRes && <Text>Tip to post status: {this.state.tipRes}</Text>}
      <ShockButton
        title='request content reveal'
        onPress={() => this.reveal()}
      />
      {this.state.revealRes && <Text>Reveal response: {this.state.revealRes}</Text>}
      <ShockButton
        title='request seed token'
        onPress={() => this.seed()}
      />
      {this.state.seedRes && <Text>Seed res: {this.state.seedRes}</Text>}
    </View>
  }
}

