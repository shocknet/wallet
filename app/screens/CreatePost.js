import React from 'react'
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ToastAndroid,
  ActivityIndicator,
  Image,
  Dimensions,
  PixelRatio,
} from 'react-native'

import Video from 'react-native-video'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Logger from 'react-native-file-log'
import _ from 'lodash'
import Http from 'axios'

import TextInput from '../components/TextInput'
import ShockButton from '../components/ShockButton'
import * as CSS from '../res/css'

import {
  enrollToken,
  pickFile,
  putFile,
  getMediaType,
} from '../services/seedServer'
import { Schema } from 'shock-common'

export const CREATE_POST = 'CREATE_POST'
/**
 * @typedef {import('react-navigation').NavigationScreenProp<{}, {}>} Navigation
 */
/**
 * @typedef {object} Props
 * @prop {((paragraphs: string[], images: string[]) => void)=} onPressCreate
 * @prop {Navigation} navigation
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

const style = StyleSheet.create({
  createPostContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: CSS.Colors.BACKGROUND_NEAR_WHITE,
    padding: CSS.SCREEN_PADDING,
  },
  space: {
    margin: 10,
  },
  horizontalLine: {
    width: '100%',
    borderColor: CSS.Colors.BORDER_GRAY,
    borderWidth: 1,
  },
  textInputStyle: {
    borderColor: CSS.Colors.TEXT_LIGHTEST,
    borderWidth: 1,
    borderRadius: 5,
    color: CSS.Colors.TEXT_LIGHTEST,
    textAlignVertical: 'top',
    maxHeight: 350,
  },
})
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
class CreatePost extends React.Component {
  /**
   * @type {import('react-navigation').NavigationScreenOptions}
   */
  static navigationOptions = {
    header: null,
  }

  /** @type {State} */
  state = DEFAULT_STATE

  /**
   *
   * @param {string} e
   */
  onChangeText = e => this.setState({ description: e })
  /*
  onPressPicker = () => {
    const SIZE = 480
    ImagePicker.openPicker({
      cropping: true,
      width: SIZE,
      multiple: true,
      includeBase64: true,
      cropperCircleOverlay: true,
      useFrontCamera: true,
      compressImageQuality: 0.5,
      compressImageMaxWidth: SIZE,
      mediaType: 'photo',
    })
      .then(imageOrImages => {
        const images = Array.isArray(imageOrImages)
          ? imageOrImages
          : [imageOrImages]

        for (const img of images) {
          if (img.width > SIZE) {
            throw new RangeError('Expected image width to not exceed 640')
          }

          if (img.mime !== 'image/jpeg') {
            throw new TypeError('Expected image to be jpeg')
          }

          if (img.data === null) {
            throw new TypeError('image.data === null')
          }
        }
      })
      .catch(e => {
        ToastAndroid.show(`Error inside image picker: ${e.message}`, 800)
        Logger.log(e.message)
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
          type: getMediaType(selectedFile.type),
          magnetURI: torrent.magnet,
          width: selectedWidth.toString(),
          height: selectedHeight.toString(),
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

  render() {
    const {
      error,
      images,
      selectedFile,
      selectedHeight,
      selectedWidth,
      selectedVideo,
      selectedImage,
      loadingStatus,
    } = this.state
    const imageListFileNames = images.map(image =>
      _.last(image.path.split('/')),
    )
    const source = {
      uri: selectedFile ? selectedFile.uri : '',
    }
    return (
      <SafeAreaView style={style.createPostContainer}>
        <ScrollView>
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
          <TextInput
            onChangeText={this.onChangeText}
            multiline
            numberOfLines={4}
            //@ts-ignore
            maxLine={8}
            style={style.textInputStyle}
            placeholder="Say Something"
          />
          <View style={style.space} />
          <View style={style.horizontalLine} />
          <View style={style.space} />
          <TouchableOpacity onPress={this.onPressPicker}>
            <FontAwesome5
              color={CSS.Colors.ORANGE}
              name="paperclip"
              size={32}
            />
          </TouchableOpacity>
          <View style={style.space} />
          {imageListFileNames.map(image => (
            <Text style={CSS.styles.fontMontserrat} key={image}>
              {image}
            </Text>
          ))}
          {imageListFileNames.length > 0 && <View style={style.space} />}
          <Text>{error}</Text>
          {this.state.isCreating ? (
            <View>
              <ActivityIndicator />
              {loadingStatus && <Text>Status: {loadingStatus}</Text>}
            </View>
          ) : (
            <ShockButton onPress={this.onPressCreate} title="Submit Listing" />
          )}
        </ScrollView>
      </SafeAreaView>
    )
  }
}

export default CreatePost
