/**
 * @format
 */
import React, { Component } from 'react'
import {
  Animated,
  Easing,
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/Entypo'

/**
 * @typedef {{ action?: () => void, icon: string, name: string }} Option
 *
 */

/**
 * @template T
 * @typedef {{ content: T[], totalPages: number, page: number }|T[]} Data
 */

/**
 * @template T
 * @typedef {object} Props
 * @prop {boolean} open
 * @prop {Option[]} menuOptions
 * @prop {string} title
 * @prop {() => void} toggleAccordion
 * @prop {React.ComponentType<{ data: T }>} Item
 * @prop {(item: T) => string} keyExtractor
 * @prop {((key: string) => void)=} onPressItem
 * @prop {(() => void)=} fetchNextPage Pass only when paginated
 * @prop {Data<T>} data Pass an array when not paginated.
 * @prop {boolean=} hideBottomBorder
 */

/**
 * @template T
 * @augments React.Component<Props<T>>
 */
export default class Accordion extends Component {
  static defaultProps = {
    menuOptions: [],
  }

  state = {
    open: false,
    menuOpen: false,
    menuOpenAnimation: new Animated.Value(0),
  }

  componentDidMount() {
    const { open } = this.props
    this.setState({
      open,
    })
  }

  toggleMenuOpen = () => {
    const { menuOpen, menuOpenAnimation } = this.state
    Animated.timing(menuOpenAnimation, {
      toValue: menuOpen ? 0 : 1,
      easing: Easing.inOut(Easing.ease),
      duration: 200,
    }).start()
    this.setState({
      menuOpen: !menuOpen,
    })
  }

  /**
   * @param {Option[]} options
   */
  renderTRXMenu = options => {
    const { open } = this.props
    const { menuOpenAnimation } = this.state
    if (open && options && options.length > 0) {
      return (
        <View style={styles.accordionMenu}>
          {options.map(option => (
            <TouchableWithoutFeedback onPress={option.action}>
              <Animated.View
                style={[
                  styles.accordionMenuItem,
                  {
                    opacity: menuOpenAnimation,
                    marginRight: menuOpenAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 15],
                    }),
                  },
                ]}
              >
                <View style={styles.accordionMenuItemIcon}>
                  <Icon name={option.icon} size={20} color="#294f93" />
                </View>
                <Text style={styles.accordionMenuItemText}>{option.name}</Text>
              </Animated.View>
            </TouchableWithoutFeedback>
          ))}
          <TouchableWithoutFeedback onPress={this.toggleMenuOpen}>
            <Animated.View
              style={[
                styles.accordionMenuBtn,
                {
                  transform: [
                    {
                      rotateZ: menuOpenAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '45deg'],
                      }),
                    },
                    {
                      perspective: 1000,
                    },
                  ],
                },
              ]}
            >
              <Icon name="plus" size={30} color="white" />
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      )
    }

    return null
  }

  render() {
    const {
      title,
      open,
      toggleAccordion,
      data,
      Item,
      fetchNextPage,
      menuOptions,
      keyExtractor,
      onPressItem,
      hideBottomBorder,
    } = this.props
    return (
      <View style={[styles.accordionItem, { flex: open ? 1 : 0 }]}>
        <TouchableOpacity
          onPress={toggleAccordion}
          style={styles.accordionItem}
        >
          <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={open ? ['#F5A623', '#F5A623'] : ['#194B93', '#4285B9']}
            style={[
              styles.accordionHeader,
              !open && !hideBottomBorder && styles.accordionHeaderBottomBorder,
              styles.accordionHeaderTopBorder,
            ]}
          >
            <Text style={styles.accordionHeaderText}>{title}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {!Array.isArray(data) ? (
          <FlatList
            data={data.content}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  onPressItem && onPressItem(keyExtractor(item))
                }}
              >
                <Item data={item} />
              </TouchableOpacity>
            )}
            style={{
              height: open ? '100%' : '0%',
            }}
            keyExtractor={keyExtractor}
            onEndReached={() => {
              if (data.page < data.totalPages && fetchNextPage) {
                fetchNextPage()
              }
            }}
          />
        ) : (
          <ScrollView
            style={{
              height: open ? '100%' : '0%',
            }}
          >
            {data.map(item => (
              <TouchableOpacity
                onPress={() => {
                  onPressItem && onPressItem(keyExtractor(item))
                }}
              >
                <Item data={item} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        {this.renderTRXMenu(menuOptions)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  accordionItem: {
    width: '100%',
  },
  accordionHeaderTopBorder: {
    borderTopWidth: 1,
  },
  accordionHeaderBottomBorder: {
    borderBottomWidth: 1,
  },
  accordionHeader: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderColor: '#eee',
    borderStyle: 'solid',
    elevation: 2,
  },
  accordionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  accordionMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 10,
  },
  accordionMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    paddingRight: 20,
    borderRadius: 100,
    backgroundColor: 'white',
    marginRight: 15,
    elevation: 3,
  },
  accordionMenuItemIcon: {
    marginRight: 10,
  },
  accordionMenuItemText: {
    color: '#294f93',
    fontWeight: 'bold',
  },
  accordionMenuBtn: {
    width: 45,
    height: 45,
    borderRadius: 100,
    backgroundColor: '#f5a623',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
})
