/* eslint-disable react/sort-comp */
/* eslint-disable react/prefer-stateless-function */
import React from 'react'
import {
  SafeAreaView,
  View,
  Animated,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
  PanResponder,
  StyleSheet,
  Text,
  Image
} from 'react-native'
import LottieView from 'lottie-react-native'
import { connect } from 'react-redux'
import { TabView, TabBar } from 'react-native-tab-view'
import styles from './styles'
import palette from '../../assets/palette'
import LikeScreen from './TabLike/LikeScreen'
import AboutScreen from './AboutScreen'
import CommentScreen from './TabComment/CommentScreen'
import {
  SCREEN_WIDTH,
  STATUS_BAR_HEIGHT,
  DEFAULT_PADDING,
  PROFILE_HEADER_HEIGHT,
  PROFILE_TAB_BAR_HEIGHT,
  SCROLLABLE_HEIGHT,
  BOTTOM_TAB_BAR_HEIGHT,
  MINI_HEADER_HEIGHT
} from '../../assets/dimension'
import PersonalHeader from './PersonalHeader'
import { fetchUserDataThunk, fetchDataThunk } from '../../redux/actions'
import animations from '../../assets/animations'
import { AuthHeader } from '../Auth/AuthScreen'
import { shadowIOS } from '../../assets/rootStyles'

const initialLayout = {
  height: 0,
  width: SCREEN_WIDTH
}

class PersonalScreen extends React.PureComponent {
  _panResponder = PanResponder.create({
    onMoveShouldSetResponderCapture: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return !(gestureState.dx === 0 && gestureState.dy === 0)
    },
    // onMoveShouldSetPanResponderCapture: () => true,

    onPanResponderGrant: (e, gestureState) => {
      this.state.scrollHeader.setOffset(this.state.scrollHeader.__getValue())
      this.state.scrollHeader.setValue(0)
    },

    onPanResponderMove: (e, gestureState) => {
      if (gestureState.dy > 0 && gestureState.dy <= 100) {
        // console.log(gestureState)
        this.state.scrollHeader.setValue(gestureState.dy)
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      this.state.scrollHeader.flattenOffset()
      const { refreshing } = this.state
      if (!refreshing) {
        if (gestureState.dy > 0 && gestureState.dy <= 80) {
          Animated.timing(this.state.scrollHeader, {
            toValue: 0
          }).start()
        } else {
          this.setState({ refreshing: true }, () => {
            // Animated.timing(this.state.scrollHeader, {
            //   toValue: 0,
            //   delay: 1000
            // }).start(() => this.setState({ refreshing: false }))

            this.props
              .fetchDataThunk()
              .then(() => {
                Animated.timing(this.state.scrollHeader, {
                  toValue: 0
                }).start(() => this.setState({ refreshing: false }))
              })
              .catch(error => {
                Animated.timing(this.state.scrollHeader, {
                  toValue: 0
                }).start(() => this.setState({ refreshing: false }))
                console.log(error)
              })
          })
        }
      }
    }
  })
  _panResponderScrollView = PanResponder.create({
    onMoveShouldSetResponderCapture: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      const { scrollTop } = this.state
      return !(gestureState.dx === 0 && gestureState.dy === 0) || scrollTop
    },
    onPanResponderGrant: (e, gestureState) => {
      this.state.scrollHeader.setOffset(this.state.scrollHeader.__getValue())
      this.state.scrollHeader.setValue(0)
    },

    onPanResponderMove: (e, gestureState) => {
      const { scrollTop } = this.state
      if (gestureState.dy > 0 && gestureState.dy <= 100 && scrollTop) {
        // console.log(gestureState)
        this.state.scrollHeader.setValue(gestureState.dy)
      }
    },
    onPanResponderRelease: (e, gestureState) => {
      this.state.scrollHeader.flattenOffset()
      const { refreshing } = this.state
      if (!refreshing) {
        if (gestureState.dy > 0 && gestureState.dy <= 80) {
          Animated.timing(this.state.scrollHeader, {
            toValue: 0
          }).start()
        } else {
          this.setState({ refreshing: true }, () => {
            // Animated.timing(this.state.scrollHeader, {
            //   toValue: 0,
            //   delay: 1000
            // }).start(() => this.setState({ refreshing: false }))

            this.props
              .fetchDataThunk()
              .then(() => {
                Animated.timing(this.state.scrollHeader, {
                  toValue: 0
                }).start(() => this.setState({ refreshing: false }))
              })
              .catch(error => {
                Animated.timing(this.state.scrollHeader, {
                  toValue: 0
                }).start(() => this.setState({ refreshing: false }))
                console.log(error)
              })
          })
        }
      }
    }
  })

  state = {
    scrollHeader: new Animated.Value(0),
    scrollY: new Animated.Value(0),
    index: 0,
    routes: [
      { key: 'LIKE', title: 'LIKES' },
      { key: 'COMMENT', title: 'COMMENTS' },
      { key: 'ABOUT', title: 'ABOUT' }
    ],
    refreshing: false,
    scrollTop: true
  }

  _handleRefresh = () => {
    this.setState(
      {
        refreshing: true
      },
      () => {
        this.props
          .fetchDataThunk()
          .then(() => {
            this.setState({
              refreshing: false
            })
          })
          .catch(error => {
            this.setState({
              refreshing: false
            })
            console.log(error)
          })
      }
    )
  }

  _renderHeader = props => {
    const { user } = this.props
    const translateY = this.state.scrollY.interpolate({
      inputRange: [0, SCROLLABLE_HEIGHT],
      outputRange: [0, -SCROLLABLE_HEIGHT],
      extrapolate: 'clamp'
    })

    const opacityAnimate = this.state.scrollY.interpolate({
      inputRange: [0, SCROLLABLE_HEIGHT / 2, SCROLLABLE_HEIGHT],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp'
    })

    const opacityAnimateHide = this.state.scrollY.interpolate({
      inputRange: [0, SCROLLABLE_HEIGHT / 1.6, SCROLLABLE_HEIGHT],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp'
    })

    return (
      <Animated.View
        style={{
          backgroundColor: palette.backgroundColorWhite,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          overflow: 'hidden',
          elevation: 3,
          ...shadowIOS,
          transform: [{ translateY: translateY }]
        }}
        {...this._panResponder.panHandlers}
      >
        <Animated.View
          style={{
            opacity: opacityAnimate,
            position: 'absolute',
            bottom: PROFILE_TAB_BAR_HEIGHT,
            left: 0,
            right: 0,
            backgroundColor: palette.backgroundColorWhite,
            zIndex: 0,
            height: PROFILE_HEADER_HEIGHT
          }}
        >
          <View style={{ flex: 1 }} />
          <Animated.View
            style={{
              height: MINI_HEADER_HEIGHT,
              paddingHorizontal: 24,
              alignItems: 'center',
              flexDirection: 'row'
            }}
          >
            <View style={{ flex: 1 }}>
              <Animated.Text
                style={[
                  styles.title,
                  {
                    opacity: opacityAnimate
                  }
                ]}
              >
                {!user.username ? null : user.username}
              </Animated.Text>
            </View>
            <View
              style={{
                width: 40,
                alignItems: 'flex-end'
              }}
            >
              <View
                style={{
                  height: 40,
                  width: 40,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 40,
                  backgroundColor: palette.secondaryTypographyColor,
                  overflow: 'hidden'
                }}
              >
                <Image
                  source={{ uri: user.picture }}
                  style={{ height: 40, width: 40 }}
                  resizeMode="cover"
                />
              </View>
            </View>
          </Animated.View>
        </Animated.View>
        <Animated.View style={{ opacity: opacityAnimateHide }}>
          <PersonalHeader
            refreshing={this.state.refreshing}
            _handleRefresh={this._handleRefresh}
          />
        </Animated.View>
        <TabBar
          {...props}
          style={{
            backgroundColor: palette.backgroundColorWhite,
            height: PROFILE_TAB_BAR_HEIGHT,
            borderBottomColor: palette.dividerColorNew,
            borderBottomWidth: StyleSheet.hairlineWidth
          }}
          contentContainerStyle={{
            alignItems: 'center'
          }}
          indicatorStyle={{
            backgroundColor: palette.primaryColorLight,
            height: 3
          }}
          labelStyle={{ fontFamily: 'Montserrat-SemiBold', fontSize: 14 }}
          activeColor={palette.primaryColor}
          inactiveColor={palette.secondaryTypographyColor}
        />
      </Animated.View>
    )
  }

  alignScrollViews = (view, y) => {
    // if (y <= SCROLLABLE_HEIGHT + 20) {
    if (view !== 'LIKE') {
      this._LikeScreenScrollV.getNode().scrollTo({ x: 0, y, animated: false })
    }
    if (view !== 'COMMENT') {
      this._CommentScreenScrollV
        .getNode()
        .scrollTo({ x: 0, y, animated: false })
    }
    if (view !== 'ABOUT') {
      this._AboutScreenScrollV.getNode().scrollTo({ x: 0, y, animated: false })
    }
    // }
  }

  _renderSence = ({ route }) => {
    const routeKey = route.key.toString()

    let refFunc = null
    let tabToCheck = 0
    let content = null

    switch (routeKey) {
      case 'LIKE':
        refFunc = scrollView => {
          this._LikeScreenScrollV = scrollView
        }
        tabToCheck = 0
        content = <LikeScreen />
        break

      case 'COMMENT':
        refFunc = scrollView => {
          this._CommentScreenScrollV = scrollView
        }
        tabToCheck = 1
        content = <CommentScreen />
        break

      case 'ABOUT':
        refFunc = scrollView => {
          this._AboutScreenScrollV = scrollView
        }
        tabToCheck = 2
        content = <AboutScreen />
        break

      default:
        return null
    }

    return (
      <Animated.ScrollView
        ref={refFunc}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: PROFILE_HEADER_HEIGHT + PROFILE_TAB_BAR_HEIGHT
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
          {
            useNativeDriver: true,
            listener: event => {
              const y = event.nativeEvent.contentOffset.y
              if (this.state.index === tabToCheck) {
                if (y > 0) {
                  this.setState({ scrollTop: false })
                } else {
                  this.setState({ scrollTop: true })
                }
                this.alignScrollViews(routeKey, y)
              }
            }
          }
        )}
        // {...this._panResponderScrollView.panHandlers}
      >
        <View style={styles.tabViewStyle}>{content}</View>
      </Animated.ScrollView>
    )
  }

  _refresh = nativeEvent => {
    // console.log(nativeEvent)
    const { contentOffset } = nativeEvent
    if (contentOffset.y <= 0) {
      this._handleRefresh()
    }
  }

  render() {
    const { user, isLoadingUser } = this.props
    const { refreshing } = this.state

    const translateHeaderY = this.state.scrollHeader.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 100],
      extrapolate: 'clamp'
    })
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View
          style={{
            backgroundColor: palette.primaryColor,
            height: translateHeaderY,
            justifyContent: 'center',
            alignContent: 'center'
          }}
        >
          <ActivityIndicator
            size="large"
            color={palette.backgroundColorWhite}
          />
        </Animated.View>
        <TabView
          style={{ flex: 1 }}
          navigationState={this.state}
          renderTabBar={this._renderHeader}
          renderScene={this._renderSence}
          onIndexChange={index => this.setState({ index })}
          initialLayout={initialLayout}
        />
      </SafeAreaView>
    )
  }
}
const mapStateToProps = getState => ({
  user: getState.authReducer.user,
  isLoadingUser: getState.markerReducer.isLoadingUser
})

const mapDispatchToProps = {
  fetchUserDataThunk,
  fetchDataThunk
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PersonalScreen)
