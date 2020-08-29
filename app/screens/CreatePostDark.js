import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableHighlight,
  ImageBackground,
  //FlatList,
  PixelRatio,
  Dimensions,
  Image,
  ToastAndroid,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import Http from 'axios'
import Logger from 'react-native-file-log'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import * as CSS from '../res/css'
import Pad from '../components/Pad'
import InputGroup from '../components/InputGroup'

// @ts-ignore
import ArrowLeft from '../assets/images/arrow-left.svg'
// @ts-ignore
import PublicIcon from '../assets/images/create-post/public.svg'
// @ts-ignore
import SubscribersIcon from '../assets/images/create-post/subscribers.svg'
// @ts-ignore
import PaywallIcon from '../assets/images/create-post/paywall.svg'

//import DropDownPicker from 'react-native-dropdown-picker'
//import Icon from 'react-native-vector-icons/Feather'
import {
  pickFile,
  getMediaType,
  putFile,
  enrollToken,
} from '../services/seedServer'
import { Schema } from 'shock-common'
import Video from 'react-native-video'
import notificationService from '../../notificationService'

export const CREATE_POST_DARK = 'CREATE_POST_DARK'

/**
 * @typedef {object} Props
 * @prop {any} navigation
 */

/**
 * @typedef {object} SelectedFile
 * @prop {string} fileName
 * @prop {string} type
 * @prop {string} path
 * @prop {string} uri
 * @prop {string=} name
 */

/**
 * @typedef {object} State
 * @prop {boolean} isCreating
 * @prop {string} shareMode
 * @prop {any[]} images
 * @prop {string} description
 * @prop {string} serviceUrl
 * @prop {string} serviceToken
 * @prop {SelectedFile|null} selectedFile
 * @prop {number} selectedWidth
 * @prop {number} selectedHeight
 * @prop {boolean} selectedVideo
 * @prop {boolean} selectedImage
 * @prop {string|null} error
 * @prop {string|null} loadingStatus
 */

/** @type {State} */
const DEFAULT_STATE = {
  isCreating: false,
  shareMode: 'public',
  description: '',
  images: [],
  error: null,
  loadingStatus: null,
  serviceUrl: 'https://webtorrent.shock.network',
  serviceToken: 'jibberish',

  selectedVideo: false,
  selectedImage: false,
  selectedFile: null,
  selectedWidth: 0,
  selectedHeight: 0,
}

/**
 *
 * @param {{w:number,h:number}} param0
 */
const getMediaStyle = ({ w, h }) => {
  const screenR = PixelRatio.get()
  const rW = PixelRatio.roundToNearestPixel(w / screenR)
  const rH = PixelRatio.roundToNearestPixel(h / screenR)
  const windowWidth = Dimensions.get('window').width
  const factor = rW > windowWidth ? 1 : rW / windowWidth
  const s = StyleSheet.create({
    video: {
      width: rW > windowWidth ? '100%' : rW,
      height: (rH / rW) * windowWidth * factor,
    },
  })
  return s.video
}

/**
 * @augments React.Component<Props, State, never>
 */
class CreatePostDark extends React.Component {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  state = DEFAULT_STATE

  goBack = () => {
    this.props.navigation.goBack()
  }

  /**
   *
   * @param {string} e
   */
  onChangeText = e => this.setState({ description: e })

  /*
   * @param {{ value: any; }} item
   */
  /*onChangeShareMode = item => {
    this.setState({
      shareMode: item.value,
    })
  }*/

  onPressPicker = async () => {
    try {
      /**
       * @type {SelectedFile}
       */
      const file = await pickFile()
      file.name = file.fileName
      if (file.type.startsWith('image/')) {
        const size = await new Promise((res, rej) => {
          Image.getSize(file.uri, (w, h) => res({ w, h }), err => rej(err))
        })
        this.setState({
          selectedFile: file,
          selectedImage: true,
          selectedHeight: size.h,
          selectedWidth: size.w,
        })
      } else if (file.type.startsWith('video/')) {
        this.setState({
          selectedFile: file,
          selectedVideo: true,
        })
      } else {
        this.setState({ error: 'unknown file type selected' })
      }
    } catch (e) {
      this.setState({ error: e })
    }
  }

  onPressCreate = async () => {
    this.setState({
      isCreating: true,
      loadingStatus: 'enrolling token',
    })

    try {
      const { serviceToken, serviceUrl, selectedFile } = this.state
      /**
       * @type {Schema.EmbeddedImage | Schema.EmbeddedVideo | null} mediaContent
       */
      let mediaContent = null
      if (selectedFile) {
        const token = await enrollToken(serviceUrl, serviceToken)
        this.setState({
          loadingStatus: 'uploading file',
        })
        /**
         * @type {{magnet:string}} torrent
         */
        const torrent = await putFile(serviceUrl, token, selectedFile)
        this.setState({
          loadingStatus: 'uploading metadata',
        })
        const { selectedWidth, selectedHeight } = this.state
        mediaContent = {
          //@ts-ignore
          type: getMediaType(selectedFile.type),
          magnetURI: torrent.magnet,
          //@ts-ignore
          width: selectedWidth,
          //@ts-ignore
          height: selectedHeight,
        }
      }

      const { description } = this.state
      const dataToSendToService = {
        paragraphs: description.split('\n'),
        //images: images.map(image => image.data),
      }
      /**
       * @type {(Schema.EmbeddedVideo|Schema.EmbeddedImage|Schema.Paragraph)[]}
       */
      const contentItems = [
        ...dataToSendToService.paragraphs.map(p => {
          /**
           * @type {Schema.Paragraph} paragraph
           */
          const paragraph = {
            type: 'text/paragraph',
            text: p,
          }
          return paragraph
        }),
      ]
      if (mediaContent) {
        contentItems.push(mediaContent)
      }
      // eslint-disable-next-line no-console
      console.log('onPressCreate dataToSendToService', dataToSendToService)
      const res = await Http.post(`/api/gun/wall`, {
        tags: [],
        title: 'Post',
        contentItems,
      })

      if (res.status !== 200) {
        throw new Error(`Status not OK`)
      } else {
        this.props.navigation.goBack()
      }
    } catch (e) {
      const msg = `Error: ${e.message ||
        e.data.errorMessage ||
        e.response.data.errorMessage ||
        'Unknown error'}`
      notificationService.Log('TESTING', msg)
      ToastAndroid.show(msg, 800)
      Logger.log(msg)
    } finally {
      this.setState({
        isCreating: false,
        loadingStatus: null,
      })
    }
  }

  /**
   *
   * @typedef {object} NaturalSize
   * @prop {number} height
   * @prop {number} width
   */

  /**
   * @param {{naturalSize:NaturalSize}} e
   */
  onVideoLoad = e => {
    this.setState({
      selectedHeight: e.naturalSize.height,
      selectedWidth: e.naturalSize.width,
    })
  }

  // @ts-ignore
  _renderPostItem({ item }) {
    return (
      <View style={styles.postContainer}>
        <ImageBackground
          source={item.image}
          resizeMode="cover"
          style={styles.postImageBackground}
        >
          {item.offer && (
            <View style={styles.offerPost}>
              <FontAwesome name="check-circle" size={36} color="white" />
            </View>
          )}
        </ImageBackground>
      </View>
    )
  }

  render() {
    const {
      error,
      //images,
      selectedFile,
      selectedHeight,
      selectedWidth,
      selectedVideo,
      selectedImage,
      loadingStatus,
    } = this.state
    const source = {
      uri: selectedFile ? selectedFile.uri : '',
    }
    return (
      <ScrollView style={styles.mainContainer}>
        <Pad amount={50} />
        <View style={styles.subContainerDark}>
          <View style={styles.upperContainer}>
            <View style={styles.backButton}>
              <TouchableOpacity onPress={this.goBack}>
                <ArrowLeft size={19} />
              </TouchableOpacity>
            </View>
            <View>
              <Text style={styles.caption}>Say Something</Text>
            </View>
            <Pad amount={32} />
            <InputGroup
              value={this.state.description}
              label="Description"
              multiline
              inputStyle={styles.descInputDark}
              //labelStyle={styles.labelDark}
              style={styles.descContainer}
              onChange={this.onChangeText}
              placeholder="Order our famouse souce and dry rubs"
            />
            {/*<View style={styles.dropdownContainerView}>
              <DropDownPicker
                items={[
                  {
                    label: 'Public',
                    value: 'public',
                    icon: () => <PublicIcon />,
                  },
                  {
                    label: 'Subscribers',
                    value: 'subscribers',
                    icon: () => <SubscribersIcon />,
                  },
                  {
                    label: 'Paywall',
                    value: 'paywall',
                    icon: () => <PaywallIcon />,
                  },
                ]}
                defaultValue={this.state.shareMode}
                containerStyle={styles.dropdownContainer}
                style={styles.dropdown}
                itemStyle={styles.dropdownItem}
                dropDownStyle={styles.dropdownDropdown}
                onChangeItem={this.onChangeShareMode}
                labelStyle={styles.dropdownLabel}
                arrowColor="#B2B2B2"
              />
            </View>*/}
          </View>
          <View style={styles.horizontalLine} />
          <View style={styles.belowContainer}>
            <View style={styles.contentTypes}>
              {/*<TouchableOpacity style={styles.contentType1}>
                <Icon name="check" color="white" size={15} />
                <Text style={styles.contentTypeText1}>Offers</Text>
              </TouchableOpacity>*/}
              <TouchableOpacity
                style={styles.contentType2}
                onPress={this.onPressPicker}
              >
                <Text style={styles.contentTypeText2}>Content</Text>
              </TouchableOpacity>
            </View>
            {/*<View style={styles.postsCarousel}>
              <FlatList
                data={testDatas}
                renderItem={this._renderPostItem}
                horizontal
              />
            </View>*/}

            {selectedImage && (
              <Image
                style={getMediaStyle({ w: selectedWidth, h: selectedHeight })}
                source={source}
              />
            )}
            {selectedVideo && (
              <Video
                // eslint-disable-next-line
                ref={ref => {
                  this.player = ref
                }}
                style={getMediaStyle({ w: selectedWidth, h: selectedHeight })}
                controls
                onLoad={this.onVideoLoad}
                source={source}
              />
            )}

            <Pad amount={10} />
            {this.state.isCreating ? (
              <View>
                <ActivityIndicator />
                {loadingStatus && <Text>Status: {loadingStatus}</Text>}
                {error && <Text>Error: {error}</Text>}
              </View>
            ) : (
              <View style={styles.actionButtonsDark}>
                <TouchableHighlight
                  underlayColor="transparent"
                  style={styles.actionButtonDark1}
                  onPress={this.goBack}
                >
                  <Text style={styles.actionButtonTextDark1}>Cancel</Text>
                </TouchableHighlight>
                <TouchableHighlight
                  underlayColor="transparent"
                  style={styles.actionButtonDark2}
                  onPress={this.onPressCreate}
                >
                  <Text style={styles.actionButtonTextDark2}>Save</Text>
                </TouchableHighlight>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    )
  }
}

export default CreatePostDark

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'rgba(22, 25, 28, .94)',
    //paddingVertical: 50,
    flex: 1,
  },
  subContainerDark: {
    flexDirection: 'column',
  },
  backButton: {
    alignItems: 'flex-start',
  },
  caption: {
    fontFamily: 'Montserrat-700',
    fontSize: 20,
    color: '#F3EFEF',
    backgroundColor: 'transparent',
    textAlign: 'center',
    width: '100%',
  },
  actionButtonsDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  actionButtonDark1: {
    width: '48%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#001220',
    borderColor: '#4285B9',
    borderWidth: 1,
  },
  actionButtonDark2: {
    width: '48%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#4285B9',
    borderColor: CSS.Colors.BACKGROUND_WHITE,
    borderWidth: 1,
  },
  actionButtonTextDark1: {
    color: '#4285B9',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
  },
  actionButtonTextDark2: {
    color: '#212937',
    fontFamily: 'Montserrat-700',
    fontSize: 14,
  },
  /*labelDark: {
    fontSize: 15,
    color: '#BBBBBB',
    fontFamily: 'Montserrat-600',
    marginBottom: 11,
    paddingLeft: 7,
  },*/
  descInputDark: {
    height: 90,
    textAlignVertical: 'top',
  },
  descContainer: {
    marginBottom: 0,
  },
  /*dropdownContainerView: {
    alignItems: 'flex-end',
    marginRight: -4,
  },*/
  /*dropdownContainer: {
    height: 33,
    width: '40%',
  },*/
  /*dropdown: {
    backgroundColor: '#001220',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor: '#4285B9',
    borderWidth: 1,
  },*/
  /*dropdownItem: {
    justifyContent: 'flex-start',
  },*/
  /*dropdownDropdown: {
    backgroundColor: '#001220',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginTop: -34,
    borderColor: '#4285B9',
    borderWidth: 1,
  },*/
  /*dropdownLabel: {
    color: '#BBB8B8',
    fontFamily: 'Montserrat-600',
    textAlignVertical: 'center',
    fontSize: 12,
  },*/
  horizontalLine: {
    width: '100%',
    borderColor: '#4285B9',
    borderWidth: 1,
    marginTop: 37.5,
    marginBottom: 27.5,
  },
  contentTypes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 25,
    marginBottom: 12,
  },
  /*contentType1: {
    width: '48%',
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderColor: '#4285B9',
    borderWidth: 1,
    flexDirection: 'row',
  },*/
  contentType2: {
    width: '48%',
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderColor: CSS.Colors.BACKGROUND_WHITE,
    borderWidth: 1,
    flexDirection: 'row',
  },
  /*contentTypeText1: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    fontSize: 12,
    marginLeft: 10,
  },*/
  contentTypeText2: {
    color: CSS.Colors.TEXT_WHITE,
    fontFamily: 'Montserrat-700',
    fontSize: 12,
  },
  upperContainer: {
    paddingHorizontal: 20,
  },
  belowContainer: {
    paddingHorizontal: 20,
  },
  /*postsCarousel: {
    paddingVertical: 40,
  },*/
  offerPost: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, .57)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  postContainer: {
    width: 91,
    height: 91,
    marginRight: 21,
  },
  postImageBackground: {
    width: 91,
    height: 91,
  },
})
