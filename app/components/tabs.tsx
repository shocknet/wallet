import React from 'react'
import { View, TouchableWithoutFeedback, StyleSheet, Text } from 'react-native'

import * as CSS from '../res/css'

interface Props {
  onPressTab?(idx: number): void
  selectedTabIndex: number
  texts: string[]
}

const Tabs: React.FC<Props> = ({ onPressTab, texts, selectedTabIndex }) => (
  <View style={styles.container}>
    {texts.map((text, i) => (
      <TouchableWithoutFeedback
        onPress={
          onPressTab
            ? () => {
                onPressTab(i)
              }
            : undefined
        }
        key={text}
      >
        <Text
          style={
            selectedTabIndex === i
              ? styles.tabButtonTextSelected
              : styles.tabButtonText
          }
        >
          {text}
        </Text>
      </TouchableWithoutFeedback>
    ))}
  </View>
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  tabButtonText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 18,
    color: CSS.Colors.GRAY_LIGHT,
    letterSpacing: 0,
  },
  tabButtonTextSelected: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 18,
    color: CSS.Colors.DARK_MODE_CYAN,
    letterSpacing: 0,
  },
})

const MemoizedTabs = React.memo(Tabs)

export default MemoizedTabs
