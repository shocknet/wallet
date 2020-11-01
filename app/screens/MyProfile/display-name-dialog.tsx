import React from 'react'
import { View } from 'react-native'

import BasicDialog from '../../components/BasicDialog'
import ShockInput from '../../components/ShockInput'
import * as Store from '../../store'
import * as CSS from '../../res/css'
import IGDialogBtn from '../../components/IGDialogBtn'

interface Props {
  onSubmit(t: string): void
  onRequestClose(): void
  visible: boolean
}

interface State {
  input: string
}

export default class DisplayNameDialog extends React.PureComponent<
  Props,
  State
> {
  state: State = {
    input: '',
  }

  componentDidUpdate({ visible }: Props) {
    const opened = !visible && this.props.visible

    if (opened) {
      const {
        auth: { gunPublicKey },
        users,
      } = Store.getStore().getState()
      const { displayName } = users[gunPublicKey]

      this.setState({
        input: displayName || '',
      })
    }
  }

  onRequestClose = () => {
    this.setState({ input: '' })
    this.props.onRequestClose()
  }

  onChangeText = (input: string) => this.setState({ input })

  onSubmit = () => {
    this.props.onSubmit(this.state.input)
  }

  render() {
    const { visible } = this.props
    const { input } = this.state

    return (
      <BasicDialog
        onRequestClose={this.onRequestClose}
        title="Display Name"
        visible={visible}
      >
        <View style={CSS.styles.alignItemsStretch}>
          <ShockInput onChangeText={this.onChangeText} value={input} />

          <IGDialogBtn
            disabled={input.length === 0}
            title="OK"
            onPress={this.onSubmit}
          />
        </View>
      </BasicDialog>
    )
  }
}
