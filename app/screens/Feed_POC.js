// @ts-nocheck
import React from 'react'
import { Text, View, StyleSheet, SafeAreaView, FlatList } from 'react-native'
import { connect } from 'react-redux'
import ShockWebView from '../components/ShockWebView'
import { WebView } from 'react-native-webview'
import FeedItem from '../components/FeedItem'
import { addPost } from '../actions/FeedActions'
import notificationService from '../../notificationService'
import Http from 'axios'

//import { updateSelectedFee, updateFeesSource } from '../actions/FeesActions'
//import ShockInput from '../components/ShockInput'
/** @type {number} */
// @ts-ignore
const shockBG = require('../assets/images/shock-bg.png')

export const FEED = 'FEED'

const DATA = [
  {
    id: 'bd7acbea-c1b1-46c2-aed5-3ad53abb28ba',
    ratio_x: 1024,
    ratio_y: 436,
    magnet:
      'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent',
  },
  {
    id: '3ac68afc-c605-48d3-a4f8-fbd91aa97f63',
    ratio_x: 1920,
    ratio_y: 804,
    magnet:
      'magnet:?xt=urn:btih:c9e15763f722f23e98a29decdfae341b98d53056&dn=Cosmos+Laundromat&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fcosmos-laundromat.torrent',
  },
  {
    id: '58694a0f-3da1-471f-bd96-145571e29d72',
    ratio_x: 1920,
    ratio_y: 1080,
    magnet:
      'magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fbig-buck-bunny.torrent',
  },
]

/**
 * @typedef {object} Props
 *
 */

/**
 * @typedef {object} State
 */

/**
 * @typedef {ReturnType<typeof mapStateToProps> & typeof mapDispatchToProps} ConnectedRedux
 */

/**
 * @augments React.Component<Props, State, never>
 */
class Feed extends React.Component {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  async componentDidMount() {
    try {
      notificationService.Log('TESTING', 'ECCOMI YO')
      const data = await Http.get(`/api/gun/feedpoc`)
      notificationService.Log('TESTING', JSON.stringify(data))
    } catch (e) {
      notificationService.Log('TESTING', 'ERROR DETECTED')
      notificationService.Log('TESTING', JSON.stringify(e))
    }
  }

  render() {
    //notificationService.Log("TESTING",JSON.stringify(this.props.feed))
    /*const feedData = []
    this.props.feed.feed.forEach(element => {
      //notificationService.Log("TESTING",JSON.stringify(element))
      feedData.push(element.media[0])
    });
    notificationService.Log("TESTING",JSON.stringify(feedData))*/
    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          data={this.props.feed.feed}
          //eslint-disable-next-line
          renderItem={({ item }) => <FeedItem {...item} />}
          //eslint-disable-next-line
          keyExtractor={item => item.id}
        />
      </SafeAreaView>
    )
  }
}

/**
 * @param {typeof import('../../reducers/index').default} state
 */
const mapStateToProps = ({ feed }) => ({ feed })

const mapDispatchToProps = {
  addPost,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Feed)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 3,
  },
})
/*
/**
 * @param {typeof import('../../reducers/index').default} state
 */
/*
const mapStateToProps = ({ fees }) => ({ fees })

const mapDispatchToProps = {
  updateSelectedFee,
  updateFeesSource,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(WalletSettings)

const styles = StyleSheet.create({
  bigBold: {
    marginTop: 25,
    fontWeight: 'bold',
    fontSize: 24,
  },
  midBold: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  flexCenter: {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  centerBold: {
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  w_80: {
    width: '80%',
  },
  w_20: {
    alignItems: 'center',
    width: '20%',
  },
  d_flex: {
    display: 'flex',
    flexDirection: 'row',
  },
  bottom: {
    position: 'absolute',
    bottom: 50,
  },
})
*/
