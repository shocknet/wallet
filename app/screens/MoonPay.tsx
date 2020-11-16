import React from 'react'
import {
  View,
  ToastAndroid,
} from 'react-native'

import WebView from 'react-native-webview'
import * as Wallet from '../services/wallet'

type CompleteWebView = WebView & { postMessage: (message: string) => void }

class MoonPay extends React.PureComponent {

  state = {
    uri:""
  }

  webview: CompleteWebView | null = null

  assignRef = (ref: WebView) => {
    this.webview = ref as CompleteWebView
  }

  componentDidMount(){
    Wallet.newAddress(true)
    .then(address => {
      ToastAndroid.show(address,900)
      this.setState({
        uri:`https://buy-staging.moonpay.io/?apiKey=pk_test_HudfmyQTH3A1bHaq4SKrRiNgRoAYOir7&currencyCode=btc&walletAddress=${address}`
      })
    })

  }

  render() {
    const {uri} = this.state
    return <View style={{height:"100%",width:"100%"}}>
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