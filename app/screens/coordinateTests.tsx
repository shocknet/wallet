import React from 'react'
import {
  View,
  Text,
  Clipboard,
  ToastAndroid,
  StyleSheet,
} from 'react-native'
import Http from 'axios'

import {pickFiles,PickedFile,putFile} from '../services/seedServer'
import ShockInput from '../components/ShockInput'
import ShockButton from '../components/ShockButton'
import ShockWebView from '../components/ShockWebView'
import { getNodeURL, rifle, get as httpGet } from '../services'
import { Schema } from 'shock-common'
///api/lnd/unifiedTrx
type State = {
  seedProviderPub?:string
  receiverPub?:string
  postID?:string
  spontRes?:string
  tipRes?:string
  revealRes?:string
  seedRes?:string
  loading:boolean
  receiver?:boolean
  fileErr?:string
  publicFiles?:PickedFile[]
  privateFiles?:PickedFile[]
  fetchedPost?:any
  createdPost?:Schema.Post
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

  pickFiles(priv :boolean){
    return () =>{
      pickFiles('photo',3)
      .then((files) => {
        if(priv){
          this.setState({privateFiles:files})
        } else {
          this.setState({publicFiles:files})
        }
      })
      .catch(e => this.setState({fileErr:JSON.stringify(e)}))
    }
  }
  seedReq(to:string,n:number = 1){
    return Http.post('/api/lnd/unifiedTrx',{
      type: 'torrentSeed',
      amt: 100,
      to,
      memo:'',
      feeLimit:500,
      ackInfo:n
    })
  }
  createTestPost(){
    ToastAndroid.show("mmh",800)
    const {seedProviderPub,privateFiles,publicFiles} = this.state
    if(!seedProviderPub){
      ToastAndroid.show("wat",800)
      return
    }
    if(!privateFiles && !publicFiles){
      ToastAndroid.show("pick some media",800)
      return 
    }
    if(!publicFiles){
      ToastAndroid.show("select public media too to create post",800)
      return
    }
    ToastAndroid.show("oke?",800)
    this.setState({loading:true})
    const tokenNum = privateFiles ? 2 : 1
    this.seedReq(seedProviderPub,tokenNum)
    .then(res => {
      if(res.status !== 200){
        ToastAndroid.show("token enroll failed",800)
        return Promise.reject()
      } else {
        const {data} = res
        const {orderAck} = data
        console.log(orderAck)
        const ack = JSON.parse(orderAck.response)
        const {seedUrl,tokens} = ack
        const proms = [putFile(seedUrl,tokens[0],publicFiles)]
        if(privateFiles){
          proms.push(putFile(seedUrl,tokens[1],privateFiles))
        }
        return Promise.all(proms)
      }
    })
    .then(torrents => {
      const [pubTorrent, privTorrent] = torrents
      const items = [{
        type: 'text/paragraph',
        text: 'this is a test post',
      },{
        type: 'image/embedded',
        magnetURI:pubTorrent.magnet,
        width:100,
        height:100,
        isPreview:false,
        isPrivate:false
      }]
      if(privTorrent){
        items.push({
          type: 'image/embedded',
          magnetURI:privTorrent.magnet,
          width:100,
          height:100,
          isPreview:false,
          isPrivate:true
        })
      }
      return Http.post('/api/gun/wall/',{
        tags: [],
        title: 'test post',
        contentItems: items,
      })
    })
    .then(r => {
      const {data,status} = r
      if(status !== 200){
        return
      }
      this.setState({loading:false,postID:data[0],createdPost:data[1]})
    })
    .catch(e => {
      console.log(e)
      this.setState({loading:false,postID:JSON.stringify(e)})
    })
  }
  async fetchPostFromId(){
    const {postID,receiverPub} = this.state 
    const url = await getNodeURL()
    if(!postID || !receiverPub || !url){
      return
    }
    this.setState({loading:true})
    const socket = rifle(url,`${receiverPub}::posts>${postID}::on`)
    socket.on('$shock',() => {
      httpGet(`api/gun/otheruser/${receiverPub}/load/posts>${postID}`,{})
      //@ts-expect-error
      .then(res => this.setState({fetchedPost:res.data,loading:false}))
      .catch(e => this.setState({fetchedPost:e,loading:false}))
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
      this.setState({loading:false,revealRes:JSON.parse(data.orderAck.response)})
    })
    .catch(e => {
      this.setState({loading:false,revealRes:JSON.stringify(e)})
    })
  }
  

  handleReceiverMedia(type:'private'|'public'){
    switch (type) {
      case 'public':{
        const {publicFiles} = this.state
        if(!publicFiles){
          return
        }
        return publicFiles.map((file,i) => <Text key={i}> {i}: NAME: {file.fileName} W: {file.width} H: {file.height} </Text>)
      }
      case 'private':{
        const {privateFiles} = this.state
        if(!privateFiles){
          return
        }
        return privateFiles.map((file,i) => <Text key={i}> {i}: NAME: {file.fileName} W: {file.width} H: {file.height} </Text>)
      }
      default:
        return;
    }
  }

  renderPost(){
    const {postID,fetchedPost } = this.state
    if(!postID || !fetchedPost ){
      return
    }
    const post = fetchedPost as Schema.Post
    const publicContents: (Schema.EmbeddedImage|Schema.EmbeddedVideo)[] = []
    const privateContents: (Schema.EmbeddedImage|Schema.EmbeddedVideo)[] = []
    const paragraphs: Schema.Paragraph[] = []
    Object.entries(post.contentItems).forEach(([_, content]) => {
      if(content.type === 'text/paragraph'){
        paragraphs.push(content)
        return
      }
      if(content.isPrivate){
        privateContents.push(content)
      } else {
        publicContents.push(content)
      }
    })
    //only care about the first one
    const [publicContent] = publicContents
    const {revealRes} = this.state
    let revealedMagnet = null
    //@ts-expect-error
    if(revealRes && revealRes.unlockedContents){
      //@ts-expect-error
      Object.entries(revealRes.unlockedContents).forEach(([contentID,content]) => {
        if(post.contentItems[contentID]){
          revealedMagnet = content
        }
      })
    }
    return <View>
      <Text>PUBLIC CONTENT:</Text>
      <View style={{height:200}}>
      <ShockWebView
        type={'image'}
        height={200}
        width={200}
        magnet={publicContent.magnetURI}
      />
      </View>
      <Text>PRIVATE CONTENT: {privateContents.length > 0 && revealedMagnet === null && '**There is some private content that can be revealed'}</Text>
      {revealedMagnet && <View style={{height:200}}>
      <ShockWebView
        type={'image'}
        height={200}
        width={200}
        magnet={revealedMagnet}
      />
      </View>}
    </View>
  }

  render() {
    if(this.state.loading){
      return <View style={styles.topContainer}><Text>LOADING:...</Text></View>
    }
    if(this.state.receiver === true){
      const mapped = this.state.createdPost && Object.values(this.state.createdPost.contentItems).map((item,i) => {
        if(item.type !== 'text/paragraph'){
          return <View key={i} style={{height:200}}>
        
          <ShockWebView
          type={'image'}
          height={200}
          width={200}
          magnet={item.magnetURI}
        />
        </View>
        } else {
          return <Text>PARAGRAPH</Text>
        }
      })

      return <View style={styles.topContainer}>
        
        <ShockButton
          title='pick public files'
          onPress={this.pickFiles(false)}
        />
        <ShockButton
          title='pick private files'
          onPress={this.pickFiles(true)}
        />
        {this.state.publicFiles && <Text>YOU SELECTED {this.state.publicFiles.length} PUBLIC FILE(s):</Text>}
        {this.handleReceiverMedia('public')}
        {this.state.privateFiles && <Text>YOU SELECTED {this.state.privateFiles.length} PRIVATE FILE(s):</Text>}
        {this.handleReceiverMedia('private')}
        {this.state.fileErr && <Text>{this.state.fileErr}</Text>}
        <ShockInput
          placeholder='seed provider pub'
          onChangeText={(text:string) => this.setState({seedProviderPub:text})}
          value={this.state.seedProviderPub || ''}
        />
        <ShockButton
          title='create test post'
          onPress={() => this.createTestPost()}
        />
        {this.state.postID && <Text>Post ID: {this.state.postID}</Text>}
        {this.state.postID && <ShockButton title='copy id' onPress={() => this.copyToClipboard(this.state.postID || '')}/>}
        {mapped}
      </View>
    }
    if(this.state.receiver === false){
      return <View style={styles.topContainer}>
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
          title='load post'
          onPress={() => this.fetchPostFromId()}
        />
        {this.renderPost()}
        <ShockButton
          title='send tip to post'
          onPress={() => this.sendTip()}
        />
        {this.state.tipRes && <Text>Tip to post status: {this.state.tipRes}</Text>}
        <ShockButton
          title='request content reveal'
          onPress={() => this.reveal()}
        />
        {/*this.state.revealRes && <Text>Reveal response: {this.state.revealRes}</Text>*/}
      </View>
    }
    return <View style={styles.topContainer}>
      
      <ShockButton
          title='CREATE POST AND RECEIVE'
          onPress={() => this.setState({receiver:true})}
        />
      <ShockButton
          title='SEND TO POST'
          onPress={() => this.setState({receiver:false})}
        />
      
    </View>
  }
}

const styles = StyleSheet.create({
  topContainer:{
    paddingTop:50
  }
})