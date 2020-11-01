import React from 'react'
import { View, UIManager, findNodeHandle, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import Logger from 'react-native-file-log'

const ICON_SIZE = 24

type Props = {
  actions: string[]
  onPress: (item: string, index: number | undefined) => void
}
type State = {
  icon: Icon | null
}

export default class PopupMenu extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      icon: null,
    }
  }

  onError() {
    Logger.log('Popup Error')
  }

  onPress = () => {
    if (this.state.icon) {
      UIManager.showPopupMenu(
        //@ts-expect-error
        findNodeHandle(this.state.icon),
        this.props.actions,
        this.onError,
        this.props.onPress,
      )
    }
  }

  render() {
    return (
      <View>
        <TouchableOpacity onPress={this.onPress}>
          <Icon
            name="more-vert"
            size={ICON_SIZE}
            color={'grey'}
            ref={this.onRef}
          />
        </TouchableOpacity>
      </View>
    )
  }

  onRef = (icon: Icon | null) => {
    if (!this.state.icon) {
      this.setState({ icon })
    }
  }
}
