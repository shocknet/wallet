import React from 'react'
import * as RN from 'react-native'

export default class App extends React.PureComponent {
  render() {
    return (
      <RN.View style={{ flex: 1 }}>
        <RN.Text style={{ textAlign: 'center', fontSize: 36 }}>
          {Math.round(Math.random() * 100)}
        </RN.Text>
      </RN.View>
    )
  }
}
