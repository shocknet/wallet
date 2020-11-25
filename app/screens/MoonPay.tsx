import React from 'react'
import {
  View,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native'
import Logger from 'react-native-file-log'

import WebView from 'react-native-webview'
import Pad from '../components/Pad'
import * as Wallet from '../services/wallet'
import Nav from '../components/Nav'

type CompleteWebView = WebView & { postMessage: (message: string) => void }

const signingServiceUrl = 'https://moon-sign.shock.network/sign'
const apiPubKey = 'pk_test_C8jSPDtsKQqXwP7nkScpqZI5tsaOiQPH'

type Props = {
  navigation: import('react-navigation').NavigationScreenProp<{}, {}>
}
class MoonPay extends React.PureComponent<Props> {

  state = {
    uri:"",
    loading:true
  }

  webview: CompleteWebView | null = null

  assignRef = (ref: WebView) => {
    this.webview = ref as CompleteWebView
  }

  componentDidMount(){
    Wallet.newAddress(true)
    .then(address => {
        const originalUrl =`https://buy-staging.moonpay.io/?apiKey=${apiPubKey}&currencyCode=btc&walletAddress=${address}`
        return fetch(signingServiceUrl,{
          method: 'post',
          headers: {
            "Content-type": "application/json"
          },
          body:JSON.stringify({originalUrl})
        })
        .then(res => res.json())
        .then(json =>{
          if(json.urlWithSignature){
            this.setState({
              uri:json.urlWithSignature,
              loading:false
            })
            Logger.log("MOONPAY SIGNATURE DONE"+json.urlWithSignature)

          }
        })
        .catch(e => {
          this.setState({loading:false})
          ToastAndroid.show('Error generating MoonPay signature',800)
          Logger.log('Error generating MoonPay signature')
          Logger.log(e)
        })
    })

  }

  render() {
    const {uri,loading} = this.state
    if(loading){
      return <View style={{height:"100%",width:"100%"}}>
      <ActivityIndicator/>
    </View>
    }
    return <View style={{height:"100%",width:"100%"}}>
      <Pad amount={30}/>
      <Nav
        light
        backButton
        title="Buy Bitcoin"
        navigation={this.props.navigation}
      />
      <WebView 
      ref={this.assignRef}
      style={{height:"100%",width:"100%"}}
      allowUniversalAccessFromFileURLs={false}
      mediaPlaybackRequiresUserAction={false}
      allowsInlineMediaPlayback={false}
      allowsFullscreenVideo={false}
      mixedContentMode="always"
      originWhitelist={ORIGIN_WHITE_LIST}
      source={{uri}}
    />
    </View>
  }
}

/*const mapStateToProps = ({ history }) => ({ history })

const mapDispatchToProps = {
  fetchPeers,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MoonPay)*/
export default MoonPay
const ORIGIN_WHITE_LIST = ['https://buy-staging.moonpay.io/','https://moonpay.io/']
