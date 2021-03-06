/**
 * Description: Nearby Sculpture Component
 * Author: Nam Bui
 **/

import React from 'react'
import { View, Image, TouchableWithoutFeedback, Animated } from 'react-native'
import { withNavigation } from 'react-navigation'
import { connect } from 'react-redux'
import styles, { IMAGE_WIDTH } from './styles'
import { icons } from '../../assets/icons'
import images from '../../assets/images'
import { _like, _unlike } from '../../redux/actions'
import baseAxios from '../../library/api'
import { _setLikeId } from '../../redux/actions/markerActions'
import ContentBox from './ContentBox'

class NearbyItem extends React.PureComponent {
  constructor(props) {
    super(props)
    this.animatedValue = new Animated.Value(0)
  }

  state = {
    isPending: false
  }

  _handleUnlike = () => {
    const { item, _like, _unlike } = this.props
    const markerId = item.id
    const { likeId } = item
    this.setState({ isPending: true })
    // this.animatedValue.setValue(1)
    // console.log(likeId)
    _unlike(markerId)

    baseAxios
      .delete(`like/${likeId}`)
      .then(() => {
        this.setState({ isPending: false })
      })
      .catch(e => {
        console.log(e.response.data.message)
        this.setState({ isPending: false })
      })
  }

  _handleLike = () => {
    const { item, _like, _unlike, _setLikeId } = this.props
    const markerId = item.id
    this.setState({ isPending: true })
    _like(markerId, 'temp')
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

    baseAxios
      .post('like', {
        sculptureId: markerId
      })
      .then(res => res.data)
      .then(resData => {
        const { likeId } = resData
        _setLikeId(markerId, likeId)
        this.setState({ isPending: false })
      })
      .catch(e => {
        console.log(e.response.data.message)
        this.setState({ isPending: false })
      })
  }

  onLikePress = () => {
    const { item, _like, _unlike, loggedIn } = this.props
    const { isPending } = this.state
    if (loggedIn) {
      if (!item.likeId) {
        if (!isPending) {
          this._handleLike()
        } else {
          console.log('is pending!!')
        }
      } else {
        if (!isPending) {
          console.log('pending: ', isPending)
          this._handleUnlike()
        } else {
          console.log('is pending!!')
        }
      }
    } else {
      this.props.navigation.navigate('Profile')
    }
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
    const { item, navigation, distanceMatrix } = this.props
    return (
      <TouchableWithoutFeedback
        onPress={() => navigation.navigate('Detail', { id: item.id })}
      >
        <View style={[styles.nearbyItemStyle]}>
          <View style={styles.imageNearbyContainer}>
            {!item.photoURL ? (
              <Image
                source={images.empty_image}
                resizeMode="cover"
                style={[
                  styles.imageNearbyItem,
                  { width: 120, height: 75, backgroundColor: '#F6F6F6' }
                ]}
              />
            ) : (
              <Image
                source={{ uri: item.photoURL, cache: 'force-cache' }}
                resizeMode="cover"
                style={styles.imageNearbyItem}
              />
            )}
            {this._renderOverlay()}
            <View style={styles.nearbyItemDetail}>
              <TouchableWithoutFeedback onPress={this.onLikePress}>
                <View style={[{ padding: 5, margin: -5 }]}>
                  {item.likeId ? icons.like_fill_img : icons.like_transparent}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <ContentBox item={item} distanceMatrix={distanceMatrix} />
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const mapStateToProps = getState => ({
  distanceMatrix: getState.distanceReducer.distanceMatrix,
  loggedIn: getState.authReducer.loggedIn,
  markerMatrix: getState.markerReducer.markerMatrix
})

const mapDispatchToProps = {
  _like,
  _unlike,
  _setLikeId
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withNavigation(NearbyItem))
