/**
 * Description: About Screen
 * Author: Nam Bui
 **/

import React from 'react'
import { Text, View, TouchableOpacity, AsyncStorage } from 'react-native'
import { withNavigation } from 'react-navigation'
import * as WebBrowser from 'expo-web-browser'
import { connect } from 'react-redux'
import FeatureCard from './FeatureCard'
import styles from './styles'
import { icons } from '../../assets/icons'
import palette from '../../assets/palette'
import { signInRejected } from '../../redux/actions/authActions'
import { clearData } from '../../library/asyncStorage'
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID } from '../../library/auth0'
import { AuthSession } from 'expo'

function toQueryString(params) {
  return Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join('&')
}

const _signOut = async props => {
  const redirectUrl = AuthSession.getRedirectUrl()
  const queryString = toQueryString({
    client_id: AUTH0_CLIENT_ID,
    returnTo: redirectUrl
  })

  let logoutUrl = `${AUTH0_DOMAIN}/v2/logout?${queryString}`
  if (!props.user.userId.split('|')[0].includes('auth0')) {
    console.log('log out social!')
    logoutUrl = `${AUTH0_DOMAIN}/v2/logout?federated&${queryString}`
  }

  const result = await WebBrowser.openBrowserAsync(logoutUrl)

  // console.log('hey', logoutUrl)

  // console.log('result', result)

  if (result.type === 'opened' || result.type === 'cancel') {
    clearData('auth')
    clearData('recentSearchList')
    props.handleSignOut()
    props.navigation.navigate('Auth')
  }
}

const AboutScreen = props => {
  const { user } = props
  const renderAccountName = () => {
    const { userId } = user
    if (userId.split('|')[0].includes('facebook')) {
      return (
        <View style={styles.accountNameView}>
          <View style={{ flex: 1, padding: 20 }}>{icons.facebook}</View>
          <View style={{ position: 'absolute', left: 60 }}>
            <Text style={[styles.title, { fontSize: 16 }]}>
              {user.username}
            </Text>
            <Text style={(styles.description, { fontSize: 12 })}>
              Account name
            </Text>
          </View>
        </View>
      )
    } else if (userId.split('|')[0].includes('google')) {
      return (
        <View style={styles.accountNameView}>
          <View style={{ flex: 1, padding: 20 }}>{icons.google}</View>
          <View style={{ position: 'absolute', left: 60 }}>
            <Text style={[styles.title, { fontSize: 16 }]}>
              {user.username}
            </Text>
            <Text style={(styles.description, { fontSize: 12 })}>
              Account name
            </Text>
          </View>
        </View>
      )
    }
    return null
  }
  return (
    <View
      style={{
        flex: 1,
        padding: 24
      }}
    >
      <FeatureCard email={user.email} joinDate={user.joinDate} />
      {user.userId && renderAccountName()}
      <TouchableOpacity
        style={[
          styles.button,
          {
            borderWidth: 1,
            borderColor: palette.primaryColorLight
          }
        ]}
        onPress={async () => {
          await _signOut(props)
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.title,
              {
                color: palette.primaryColorLight,
                fontSize: 16,
                textAlign: 'center'
              }
            ]}
          >
            SIGN OUT
          </Text>
        </View>
      </TouchableOpacity>
    </View>
    // </SafeAreaView>
  )
}

const mapStateToProps = getState => ({
  user: getState.authReducer.user
})

const mapDispatchToProps = dispatch => ({
  handleSignOut: () => {
    clearData('auth')
    dispatch(signInRejected())
  }
})

export default withNavigation(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AboutScreen)
)
