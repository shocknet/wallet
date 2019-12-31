/**
 * @prettier
 */
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Avatar } from 'react-native-elements'

import { Colors } from '../res/css'

/**
 * @typedef {object} Props
 * @prop {string=} alternateText
 * @prop {boolean=} alternateTextBold
 * @prop {string} lowerText
 * @prop {import('react-native').ViewStyle=} lowerTextStyle
 * @prop {string|null} image
 * @prop {string} id
 * @prop {string} name
 * @prop {boolean=} nameBold
 * @prop {((id: string) => void)=} onPress
 * @prop {string=} title
 */

const DEFAULT_USER_IMAGE =
  'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QAAKqNIzIAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAAHdElNRQfjBxkUMxbYpdxEAAAC5UlEQVRo3s2ZW0gUURiAv90ldc1LappZ6S5UEpRFD0IRmUgRIRUU+tC7D2UUvUaP0XtBUFnQ5a2HboQFUWBPUhJdRDAjgyLdIm9lmO2eHkqx2Zmd/8yeY/3nbebs+b7zz5yZf86GCBL17KSelVRQBIyTYIBuOnkaaDTN2MsLlEd7zm678DyuecJn2mVybeEj3PXFKxS3CdsROCHCKxTHbeBr+C4WmGS5dFh5strJE/eNcsh8Bt6K569QvDaNX6WFVyjisoGll6BBW3mbWYHVAXJmVCCmLSD8hVRAvKxmY4VZgQJtgYVmBfSf71GzAjnaAkJlqcC4tsCoWYFP2gIJswLC4fSVpQI92gKGy7ON2u+COrMCYT5r4YeluZVeghQXtYQ7SJnNACxjSjz/HwEe3YI4JxY4awMPRQyK8IMU2hGAJqZ98dM02sID7PdR+MkBm3iAFr564ifYZxsPEOOBK75LWoZlHyGaucXknA+Rm+wiFGyo4LGAWiqBj/QzPT8zj7CeNio9zy+ljToi5sE57OAUj5hAoXjvsdCa+PDnVnzISbYHqKJcIkQjVxlPu+E6aaVitlcFrdxP6zPKFRqyusjs4VnGVT9EL70MZezTQ3MweBk3tGsAr3adUl18nH5jeIWijxod/CL6jOIVilcUywUuGccrFOel+A2krAik3OpEt5LsWHZLxzNCHHU76Iw8EtYKignKmfLLwFZ79QyFbHEeShfYbA0PsMlfYI1VgXX+AjGrAtX/WiBt48a5CqJ8s7QIf0eS6N/FizMD5VbxEJnzEncVyLeKh7TNq3Dm0xbCMcX5z8D/LiD/T8CSgJFKNmM4CE6BpHUBn52TXB5bKUZmWpd/jgu4Yw1/jyJJkiIcYcw4fIzDOh9tVZxx+R4KDj9Nlf7tUkg7T0hmhU7SzcHsaqzFtNLBG230ABdoocxvePm7r5i11FJNnCWUUkIJYXLJByaZIsUIXxhhiEHe0c9L6Qb/Lzm7beRqeYV3AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE5LTA3LTI1VDE4OjUxOjIyKzAyOjAwFmPwLQAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxOS0wNy0yNVQxODo1MToyMiswMjowMGc+SJEAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAAElFTkSuQmCC'

/**
 * @augments React.PureComponent<Props>
 */
export default class UserDetail extends React.PureComponent {
  onPress = () => {
    const { id, onPress } = this.props

    onPress && onPress(id)
  }

  avatarSrc = {}

  /** @param {Props} props */
  constructor(props) {
    super(props)
    this.avatarSrc = {
      uri:
        props.image === null
          ? 'data:image/png;base64,' + DEFAULT_USER_IMAGE
          : 'data:image/png;base64,' + props.image,
    }
  }

  /** @param {Props} prevProps */
  componentDidUpdate(prevProps) {
    const { image } = this.props

    if (image !== prevProps.image) {
      this.avatarSrc = {
        uri:
          image === null
            ? 'data:image/png;base64,' + DEFAULT_USER_IMAGE
            : 'data:image/png;base64,' + image,
      }
    }
  }

  render() {
    const {
      alternateText,
      alternateTextBold,
      nameBold,
      lowerText,
      lowerTextStyle,
      name,
      title,
    } = this.props

    return (
      <TouchableOpacity onPress={this.onPress}>
        <View style={styles.container}>
          <View style={xStyles.avatarSubContainer}>
            <Avatar rounded medium source={{}} />
          </View>

          <View style={xStyles.nameContainer}>
            {title && <Text style={styles.title}>{title}</Text>}

            <Text
              numberOfLines={1}
              style={nameBold ? styles.nameBold : styles.name}
            >
              {name}
              <Text
                style={
                  alternateTextBold
                    ? styles.alternateTextBold
                    : styles.alternateText
                }
              >
                {alternateText && ` ${alternateText}`}
              </Text>
            </Text>

            {lowerText && (
              <Text numberOfLines={2} style={lowerTextStyle && lowerTextStyle}>
                {lowerText}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }
}

const nameTextStyle = {
  color: Colors.TEXT_STANDARD,
  fontSize: 16,
}

/**
 * @type {import('react-native').ViewStyle}
 */
const alternateTextStyle = {
  // @ts-ignore TODO
  color: Colors.TEXT_LIGHT,
  fontSize: 14,
  fontWeight: '200',
}

const styles = StyleSheet.create({
  alternateText: {
    ...alternateTextStyle,
  },

  alternateTextBold: {
    ...alternateTextStyle,
    fontWeight: 'bold',
  },

  avatarContainer: {
    justifyContent: 'center',
  },

  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  name: {
    ...nameTextStyle,
  },

  nameBold: {
    ...nameTextStyle,
    color: Colors.TEXT_STANDARD,
    fontWeight: 'bold',
  },

  subContainer: {
    paddingLeft: 4,
    paddingRight: 4,
  },

  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 10,
  },

  title: {
    color: Colors.TEXT_LIGHT,
    fontWeight: '500',
  },
})

const xStyles = {
  avatarSubContainer: [styles.avatarContainer, styles.subContainer],
  nameContainer: [styles.subContainer, styles.textContainer],
}
