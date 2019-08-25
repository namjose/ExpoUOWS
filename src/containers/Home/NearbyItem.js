import React from 'react'
import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Animated
} from 'react-native'
import styles from './styles'
import { icons } from '../../assets/icons'
import images from '../../assets/images'

class NearbyItem extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      liked: false
    }

    this.animatedValue = new Animated.Value(0)
  }

  onLikePress = () => {
    this.setState(prevState => {
      const newLiked = !prevState.liked

      if (newLiked) {
        Animated.sequence([
          Animated.spring(this.animatedValue, {
            toValue: 1,
            useNativeDriver: true
          }),
          Animated.spring(this.animatedValue, {
            toValue: 0,
            useNativeDriver: true
          })
        ]).start()
      }

      return { liked: newLiked }
    })
  }

  _renderOverlay = () => {
    const overlayHeartStyle = [
      styles.overlayHeart,
      {
        opacity: this.animatedValue,
        transform: [
          {
            scale: this.animatedValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.7, 1.5]
            })
          }
        ]
      }
    ]

    return (
      <Animated.View style={overlayHeartStyle}>
        {icons.like_fill_popup}
      </Animated.View>
    )
  }

  render() {
    const { item, navigation } = this.props
    return (
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate('Detail', { id: item.id })}
      >
        <View style={styles.nearbyItemStyle}>
          <View style={styles.imageNearbyContainer}>
            <Image
              source={images.sculptures[item.photoURL]}
              resizeMode="cover"
              style={styles.imageNearbyItem}
            />
            {this._renderOverlay()}
            <View style={styles.nearbyItemDetail}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'space-between'
                }}
              >
                <Text style={styles.title}>{item.distance}</Text>
                <Text style={styles.title}>{item.name}</Text>
              </View>
              <View
                style={{
                  alignItems: 'center'
                }}
              >
                <TouchableWithoutFeedback onPress={this.onLikePress}>
                  <View style={[{ marginTop: 10, padding: 5 }]}>
                    {this.state.liked ? icons.like_fill_white : icons.like}
                  </View>
                </TouchableWithoutFeedback>
                <Text style={[styles.like, { marginTop: 10 }]}>100</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

export default NearbyItem
