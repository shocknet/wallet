/* eslint-disable react/jsx-no-bind */
import React from 'react'
import { View } from 'react-native'

import BasicDialog from '../../components/BasicDialog'
import ShockInput from '../../components/ShockInput'
import IGDialogBtn from '../../components/IGDialogBtn'
import { getStore, getMe } from '../../store'

/**
 * @typedef {object} Props
 * @prop {(bio: string) => void} onSubmit
 */

/**
 * @typedef {object} State
 * @prop {string} bio
 * @prop {boolean} open
 */

/**
 * @augments React.Component<Props, State>
 */
export default class SetBioDialog extends React.Component {
  state = {
    bio: '',
    open: false,
  }

  open = () => {
    const state = getStore().getState()

    const me = getMe(state)
    this.setState({
      bio: me.bio || '',
      open: true,
    })
  }

  close = () => {
    this.setState({ open: false })
  }

  render() {
    const { bio } = this.state

    return (
      <BasicDialog
        onRequestClose={this.close}
        title="Bio"
        visible={this.state.open}
      >
        <View>
          <ShockInput
            onChangeText={bio => this.setState({ bio })}
            value={bio}
          />

          <IGDialogBtn
            title="OK"
            onPress={() => {
              this.close()
              this.props.onSubmit(bio)
            }}
          />
        </View>
      </BasicDialog>
    )
  }
}
