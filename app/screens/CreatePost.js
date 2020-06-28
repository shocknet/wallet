//@ts-nocheck
import React from 'react'
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5'
import Logger from 'react-native-file-log'
import _ from 'lodash'

import TextInput from '../components/TextInput'
import ShockButton from '../components/ShockButton'
import * as CSS from '../res/css'

export const CREATE_POST = 'CREATE_POST'

/**
 * @typedef {object} Props
 * @prop {((paragraphs: string[], images: string[]) => void)=} onPressCreate
 */

/**
 * @typedef {object} State
 * @prop {boolean} isCreating
 * @prop {string[]} images
 * @prop {string[]} description
 */

/** @type {State} */
const DEFAULT_STATE = {
  isCreating: false,
  description: '',
  images: [],
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

  onChangeText = e => this.setState({ description: e })

  onPressPicker = () => {
    const SIZE = 480
    ImagePicker.openPicker({
      cropping: true,
      width: SIZE,
      height: SIZE,
      multiple: true,
      includeBase64: true,
      cropperCircleOverlay: true,
      useFrontCamera: true,
      compressImageQuality: 0.5,
      compressImageMaxWidth: SIZE,
      compressImageMaxHeight: SIZE,
      mediaType: 'photo',
    })
      .then(images => {
        if (images === null) {
          throw new TypeError('image.data === null')
        }

        this.setState({
          images,
        })
      })
      .catch(e => {
        Logger.log(e.message)
      })
  }

  onPressCreate = () => {
    const { description, images } = this.state
    const dataToSendToService = {
      paragraphs: description.split('\n'),
      images: images.map(image => image.data),
    }
    // eslint-disable-next-line no-console
    console.log('onPressCreate dataToSendToService', dataToSendToService)
  }

  render() {
    const { images } = this.state
    const imageListFileNames = images.map(image =>
      _.last(image.path.split('/')),
    )
    return (
      <SafeAreaView style={style.createPostContainer}>
        <ScrollView>
          <TextInput
            onChangeText={this.onChangeText}
            multiline
            numberOfLines={4}
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
          <ShockButton onPress={this.onPressCreate} title="Submit Listing" />
        </ScrollView>
      </SafeAreaView>
    )
  }
}

export default CreatePost
