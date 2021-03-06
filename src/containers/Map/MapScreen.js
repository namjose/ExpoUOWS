/**
 * Description: Map Screen
 * Author: Nam Bui
 **/

/* eslint-disable react/sort-comp */
import React from 'react'
import {
  SafeAreaView,
  View,
  Platform,
  Animated,
  BackHandler,
  Easing,
  StyleSheet
} from 'react-native'
import * as Permissions from 'expo-permissions'
import { SafeAreaConsumer } from 'react-native-safe-area-view'
import MapView, { UrlTile, Marker, AnimatedRegion } from 'react-native-maps'
import LottieView from 'lottie-react-native'
import * as Location from 'expo-location'
import { Notifications } from 'expo'
import { connect } from 'react-redux'
import axios from 'axios'
import styles from './styles'
import {
  LATITUDE_DELTA,
  LONGITUDE_DELTA,
  URL_TEMPLATE,
  DEFAULT_EDGE_PADDING,
  LATITUDE,
  LONGITUDE,
  DISTANCE_MATRIX_API,
  GOOGLE_MAPS_APIKEY
} from '../../library/maps'
import Footer from './Footer/Footer'
import MarkersContainer from './MarkersContainer'
import Direction from './Direction'
import Header from './HeaderMap/Header'
import { icons } from '../../assets/icons'
import { SCREEN_HEIGHT, STATUS_BAR_HEIGHT } from '../../assets/dimension'
import { _handleNotification } from '../../library/notificationTask'
import animations from '../../assets/animations'
import { MapContext } from './context/MapContext'
import {
  fetchDistanceMatrix,
  selectMarker,
  unselectMarker
} from '../../redux/actions'
import SearchView from '../../components/SearchButton/SearchView'
import { compareCoordinate } from '../../library/compareCoordinate'
import { _alertLocationPermission } from '../../redux/actions/locationActions'
import palette from '../../assets/palette'

export class MapScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      tabBarVisible: navigation.getParam('showTab', true)
    }
  }

  constructor(props) {
    super(props)
    this._footerRef = React.createRef()
    this.state = {
      userLocationAnimation: new Animated.Value(1),
      showMapOnly: false,
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA
      },
      steps: [],
      centered: false,
      searchText: '',
      showSteps: false,
      showDirection: false,
      case1_footer_translateY: new Animated.Value(-SCREEN_HEIGHT),
      footer_translateY: new Animated.Value(SCREEN_HEIGHT),
      header_translateY: new Animated.Value(-SCREEN_HEIGHT),
      direction_state: {
        distance: 0,
        duration: 0,
        isDistanceLoading: true
      }
    }
  }

  _handleDirectionState = (distance, duration) => {
    this.setState({
      direction_state: {
        distance,
        duration
      }
    })
  }

  setShowDirection = showDirection => {
    const {
      footer_translateY,
      header_translateY,
      case1_footer_translateY
    } = this.state
    Animated.parallel([
      Animated.timing(case1_footer_translateY, {
        toValue: -SCREEN_HEIGHT,
        duration: 250
      }),
      Animated.timing(footer_translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250
      }),
      Animated.timing(header_translateY, {
        toValue: -SCREEN_HEIGHT,
        duration: 250
      })
    ]).start(() => {
      this.setState({ showDirection })
    })
  }

  setShowSteps = showSteps => {
    const { header_translateY } = this.state

    Animated.timing(header_translateY, {
      toValue: -500,
      duration: 250
    }).start(() => {
      this.setState({ showSteps })
    })
  }

  animate = () => {
    const {
      footer_translateY,
      header_translateY,
      case1_footer_translateY
    } = this.state
    Animated.parallel([
      Animated.timing(case1_footer_translateY, {
        toValue: 0,
        duration: 250
      }),
      Animated.timing(footer_translateY, {
        toValue: 0,
        duration: 250
      }),
      Animated.timing(header_translateY, {
        toValue: 0,
        duration: 250
      })
    ]).start()
  }

  animateHide = callback => {
    const {
      case1_footer_translateY,
      footer_translateY,
      header_translateY
    } = this.state
    Animated.parallel([
      Animated.timing(case1_footer_translateY, {
        toValue: -SCREEN_HEIGHT,
        duration: 250
      }),
      Animated.timing(footer_translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250
      }),
      Animated.timing(header_translateY, {
        toValue: -SCREEN_HEIGHT,
        duration: 250
      })
    ]).start(() => callback && callback())
  }

  componentDidMount = () => {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this._handleBackPress
    )
    this._notificationSubscription = Notifications.addListener(notification =>
      _handleNotification(notification, this.props.navigation, this._resetUI)
    )
    this._getLocationAsync()
    this._animateLoop()
    setTimeout(() => {
      this._handleNavigateFromDetail()
    }, 500)
  }

  // shouldComponentUpdate(nextProps) {
  //   const nextSelectedMarker = nextProps.selectedMarker || {}
  //   const selectedMarker = this.props.selectedMarker || {}

  //   return selectedMarker.id !== nextSelectedMarker.id
  // }

  componentDidUpdate = () => {
    this._handleNavigateFromDetail()
    // console.log('updateMap')
  }

  componentWillUnmount = () => {
    this.backHandler.remove()
    this.subscribeLocation()
    this.animation.reset()
  }

  _handleNavigateFromDetail = () => {
    const detailMarker = this.props.navigation.getParam('detailMarker', null)
    if (detailMarker) {
      this.props.navigation.setParams({ detailMarker: null })
      this._onMarkerPressed(detailMarker, true)
    }
  }

  userCoordinate = this.props.initialUserCoordinate
    ? new AnimatedRegion({
        ...this.props.initialUserCoordinate,
        latitudeDelta: 0,
        longitudeDelta: 0
      })
    : null

  subscribeLocation = null

  loopAnimate = new Animated.Value(0)
  pulseLoader = new Animated.Value(0)

  _handleBackPress = () => {
    const { selectedMarker } = this.props
    const { showDirection, showSteps } = this.state
    if (selectedMarker) {
      if (showDirection) {
        if (showSteps) {
          this._footerRef.current._collapseStepList()
          return true
        } else {
          this.setShowDirection(false)
          return true
        }
      } else {
        // this._resetUI()
        this._onClosePressed()
        return true
      }
    }
    return false
  }

  _animateLoop = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(this.loopAnimate, {
          toValue: 3,
          duration: 3000
        }),
        Animated.timing(this.loopAnimate, {
          toValue: 0,
          duration: 3000
        })
      ])
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(this.pulseLoader, {
          toValue: 1,
          duration: 2000,
          easing: Easing.in
        })
      ])
    ).start()
  }

  _getLocationAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.LOCATION)
    if (status !== 'granted') {
      Platform.OS === 'ios' && _alertLocationPermission()
      console.log('Need Location Permission')
    } else {
      console.log('Grant Permission')
      this.subscribeLocation = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1,
          distanceInterval: 1 // 1 because in map, want to show smooth animation
        },
        loc => {
          if (loc.timestamp) {
            const { latitude, longitude } = loc.coords
            if (this.userCoordinate) {
              this.userCoordinate.timing({ latitude, longitude }).start()
            } else {
              this.userCoordinate = new AnimatedRegion({
                latitude,
                longitude,
                latitudeDelta: 0,
                longitudeDelta: 0
              })
            }
          } else {
            this.setState({ errorMessage: 'Problems on update location' })
          }
        }
      )
    }
  }

  _resetUI = () => {
    this.animateHide(() => {
      this.setState({
        steps: [],
        centered: false,
        searchText: '',
        showSteps: false,
        showDirection: false
      })

      this._centerUserLocation()
      this._onClosePressed()
    })
  }

  _centerUserLocation = () => {
    const { centered } = this.state
    if (!centered) {
      const { region } = this.state
      if (this.userCoordinate) {
        const loc = this.userCoordinate.__getValue()
        const { latitude, longitude } = loc
        const userRegion = { ...region, latitude, longitude }
        this.map.animateToRegion(userRegion)
        this.setState({ centered: true })
      }
    }
  }

  _handleRegionChangeComplete = region => {
    const { centered } = this.state
    if (centered) {
      if (this.userCoordinate) {
        const loc = this.userCoordinate.__getValue()
        if (!compareCoordinate(loc, region)) {
          this.setState({ centered: false })
        }
      }
    }
  }

  _navigateToDetail = item => {
    this.props.navigation.navigate('Detail', { id: item.id })
    this._resetUI()
  }

  _renderUserLocation = () => {
    const maxSizePulse = 70
    const dotSize = this.loopAnimate.interpolate({
      inputRange: [0, 3],
      outputRange: [1, 0.6]
    })

    const sizeAnim = this.pulseLoader.interpolate({
      inputRange: [0, 1],
      outputRange: [0, maxSizePulse],
      extrapolate: 'clamp'
    })

    const opacityAnim = this.pulseLoader.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 0]
    })

    if (this.userCoordinate) {
      return (
        <Marker.Animated
          ref={marker => {
            this.marker = marker
          }}
          // tracksViewChanges={false}
          style={{ zIndex: 1 }}
          anchor={{ x: 0.5, y: 0.5 }}
          coordinate={this.userCoordinate}
          onPress={this._centerUserLocation}
        >
          <View
            style={{
              width: 80,
              height: 80,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Animated.View
              style={{
                width: sizeAnim,
                height: sizeAnim,
                // borderColor: palette.primaryColorLight,
                // borderWidth: 4 * StyleSheet.hairlineWidth,
                borderRadius: maxSizePulse,
                backgroundColor: 'rgba(0, 71, 187, 0.6)',
                opacity: opacityAnim,
                position: 'absolute'
              }}
            />
            <View
              style={{
                zIndex: 1,
                width: 20,
                height: 20,
                borderRadius: 20,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: palette.backgroundColorWhite
              }}
            >
              <Animated.View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 16,
                  backgroundColor: palette.primaryColorLight,
                  transform: [{ scale: dotSize }]
                }}
              />
            </View>
          </View>
        </Marker.Animated>
      )
    }
  }

  _handleSearch = event => {
    const { text } = event.nativeEvent
    this.setState({ searchText: text.trim() })
  }

  _onMarkerPressed = (marker, centerToMarker = false) => {
    const { region, direction_state, showDirection } = this.state
    const {
      id,
      name,
      coordinate: { latitude, longitude }
    } = marker
    if (!this.props.selectedMarker || this.props.selectedMarker.id !== id) {
      if (this.props.navigation.getParam('showTab', true)) {
        this.props.navigation.setParams({ showTab: false })
      }
      if (centerToMarker && !showDirection) {
        this.map.animateCamera({
          center: {
            latitude,
            longitude
          }
        })
      }
      this.props.handleSelectMarker(marker)
      this.setState({
        searchText: name.trim(),
        showMapOnly: false,
        direction_state: { ...direction_state, isDistanceLoading: true }
      })

      const userLocation = this.userCoordinate.__getValue()
      const origin = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      }
      const destinations = `${latitude}%2C${longitude}%7C`
      axios
        .get(
          `${DISTANCE_MATRIX_API}&origins=${origin.latitude},${origin.longitude}&destinations=${destinations}&key=${GOOGLE_MAPS_APIKEY}`
        )
        .then(res => {
          const mapData = res.data
          const distance_duration_array = mapData.rows[0].elements
          const { distance, duration } = distance_duration_array[0]
          this.setState({
            direction_state: {
              distance: distance.value,
              duration: Math.floor(duration.value / 60),
              isDistanceLoading: false
            }
          })
        })
    }
  }

  _onClosePressed = () => {
    const { footer_translateY } = this.state
    Animated.timing(footer_translateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250
    }).start(() => {
      this.props.navigation.setParams({ showTab: true })
      this.props.handleUnselectMarker()
      this.setState({ searchText: '' })
    })
  }

  _getSteps = steps => {
    this.setState({ steps })
  }

  _fitToCoordinate = coordinates => {
    this.map.fitToCoordinates(coordinates, {
      edgePadding: DEFAULT_EDGE_PADDING,
      animated: true
    })
  }

  toggleShowMapOnly = () => {
    if (Platform.OS !== 'ios') {
      this.setState(prevState => ({
        showMapOnly: !prevState.showMapOnly
      }))
      if (!this.props.selectedMarker) {
        const showTab = this.props.navigation.getParam('showTab', true)
        this.props.navigation.setParams({ showTab: !showTab })
      }
    }
  }

  render() {
    const {
      showMapOnly,
      searchText,
      region,
      showDirection,
      centered,
      steps,
      showSteps,
      footer_translateY,
      header_translateY,
      case1_footer_translateY,
      direction_state
    } = this.state

    const { setShowDirection, setShowSteps, animate, animateHide } = this
    if (region) {
      return (
        <SafeAreaView style={styles.container}>
          <MapContext.Provider
            value={{
              case1_footer_translateY,
              footer_translateY,
              header_translateY,
              showDirection,
              showSteps,
              setShowDirection,
              setShowSteps,
              animate,
              animateHide,
              direction_state
            }}
          >
            <SafeAreaConsumer>
              {insets => {
                const FIX_NOTCH_HEADER =
                  Platform.OS === 'ios' && insets.top > 20 ? insets.top - 20 : 0
                return (
                  <Header
                    fix_notch_height={FIX_NOTCH_HEADER}
                    showSteps={showSteps}
                    showDirection={showDirection}
                    showMapOnly={showMapOnly}
                    searchText={searchText}
                    _handleSearch={this._handleSearch}
                    _onClosePressed={this._onClosePressed}
                    _onMarkerPressed={this._onMarkerPressed}
                  >
                    <SearchView
                      searchText={searchText}
                      _onClosePressed={this._onClosePressed}
                      navigateTo={() => {
                        this.props.navigation.navigate('Search', {
                          _onMarkerPressed: this._onMarkerPressed,
                          searchText: this.state.searchText,
                          centerToMarker: true
                        })
                      }}
                    />
                  </Header>
                )
              }}
            </SafeAreaConsumer>

            <MapView
              style={styles.mapStyle}
              mapType={Platform.OS === 'android' ? 'none' : 'standard'}
              provider={Platform.OS === 'ios' ? 'google' : null}
              ref={ref => {
                this.map = ref
              }}
              onPress={this.toggleShowMapOnly}
              onRegionChangeComplete={region => {
                this._handleRegionChangeComplete(region)
              }}
              initialRegion={region}
              showsCompass={false}
              moveOnMarkerPress={false}
              maxZoomLevel={19}
            >
              {Platform.OS === 'android' && (
                <UrlTile urlTemplate={URL_TEMPLATE} maximumZ={19} zIndex={-1} />
              )}
              {this._renderUserLocation()}
              <MarkersContainer _onMarkerPressed={this._onMarkerPressed} />
              <Direction
                userCoordinate={this.userCoordinate}
                showDirection={showDirection}
                _getSteps={this._getSteps}
                _handleDirectionState={this._handleDirectionState}
                _fitToCoordinate={this._fitToCoordinate}
              />
            </MapView>
            <SafeAreaConsumer>
              {insets => {
                const FIX_NOTCH_BOTTOM =
                  insets.bottom > 0 ? insets.bottom + STATUS_BAR_HEIGHT : 0
                return (
                  <Footer
                    ref={this._footerRef}
                    fix_notch_height={FIX_NOTCH_BOTTOM}
                    showSteps={showSteps}
                    showDirection={showDirection}
                    showMapOnly={showMapOnly}
                    steps={steps}
                    centered={centered}
                    navigation={this.props.navigation}
                    _navigateToDetail={this._navigateToDetail}
                    _centerUserLocation={this._centerUserLocation}
                  />
                )
              }}
            </SafeAreaConsumer>
          </MapContext.Provider>
        </SafeAreaView>
      )
    }

    return null
  }
}

const mapDispatchToProps = dispatch => ({
  handleSelectMarker: marker => {
    dispatch(selectMarker(marker))
  },
  handleUnselectMarker: () => {
    dispatch(unselectMarker())
  },
  fetchDistanceMatrix: userCoordinate => {
    return dispatch(fetchDistanceMatrix(userCoordinate))
  }
})

const mapStateToProps = getState => ({
  selectedMarker: getState.markerReducer.selectedMarker,
  initialUserCoordinate: getState.locationReducer.userCoordinate
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MapScreen)
