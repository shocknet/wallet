import React from 'react'
import { View, Text, ToastAndroid } from 'react-native'
import ShockButton from '../components/ShockButton'
import {
  pickFile,
  isAllowedFormat,
  getMediaType,
  enrollToken,
  putFile,
} from '../services/seedServer'
import { Logger } from 'shock-common'
import ShockInput from '../components/ShockInput'
import { createPost } from '../services/wall'

export default class CreatePost extends React.Component {
  selectMedia = async () => {
    try {
      const file = await pickFile()
      if (!isAllowedFormat(file.type)) {
        ToastAndroid.show('please select a valid format', 800)
        Logger.error('error file format not allowed')
        return
      }
      this.props.selectFile(file)
    } catch (e) {
      Logger.error('error picking file ', e)
    }
  }

  post = async () => {
    const {
      serviceUrl,
      serviceToken,
      selectedFile,
      postParagraph,
    } = this.props.seedServer
    const mediaType = getMediaType(selectedFile.type)

    try {
      const token = await enrollToken(serviceUrl, serviceToken)
      const torrentFile = await putFile(serviceUrl, token, selectedFile)
      const post = {
        contentItems: {
          video: {
            magnetURI: torrentFile.magnet,
            type: mediaType,
            width: '',
            height: '',
          },
          text: {
            type: 'text/paragraph',
            text: postParagraph,
          },
        },
      }
      //@ts-ignore -> post needs the date ecc
      await createPost('add title input too', post)
      ToastAndroid.show(`post added succesfully`, 800)
    } catch (e) {
      ToastAndroid.show(`Error creating post ${e}`, 800)
    }
  }

  render() {
    const { updatePostParagraph } = this.props
    return (
      <View>
        <Text>Add post</Text>
        <ShockInput onChangeText={updatePostParagraph} />
        <ShockButton title="Select media" onPress={this.selectMedia} />
        <ShockButton title="Post" onPress={this.post} />
      </View>
    )
  }
}
