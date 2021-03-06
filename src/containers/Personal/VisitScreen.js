/**
 * Description: Visit Screen
 * Author: Nam Bui
 **/

import React from 'react'
import {
  SafeAreaView,
  View,
  FlatList,
  Image,
  Text,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { connect } from 'react-redux'
import { RectButton } from 'react-native-gesture-handler'
import moment from 'moment'
import styles from './styles'
import images from '../../assets/images'
import DividerLight from '../../components/Divider/DividerLight'
import palette from '../../assets/palette'
import { icons } from '../../assets/icons'
import baseAxios from '../../library/api'
import ListHeader from '../../components/ListHeader/ListHeader'
import NoResultScreen from '../../components/NoResult/NoResultScreen'

class VisitScreen extends React.PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      isLoading: true,
      refreshing: false,
      visitList: []
    }
  }

  componentDidMount = () => {
    this._fetchData()
  }

  _fetchData = () => {
    const { userId } = this.props
    baseAxios
      .get(`visit/user-id/${userId}`)
      .then(res => {
        const resData = res.data.map(element => {
          const {
            visitId,
            user: { userId },
            sculpture: { accessionId, images, name },
            visitTime
          } = element

          const imageList = images.sort((a, b) => {
            return new Date(a.created).getTime() - new Date(b.created).getTime()
          })

          return {
            visitId,
            userId,
            sculptureId: accessionId,
            sculptureName: name,
            photoURL: imageList.length ? imageList[0].url : null,
            submitDate: visitTime
          }
        })

        this.setState({
          visitList: resData,
          isLoading: false,
          refreshing: false
        })
      })
      .catch(res => {
        this.setState({ isLoading: false, refreshing: false })
      })
  }

  _renderItem = ({ item }) => {
    const { submitDate, photoURL, sculptureName, sculptureId } = item
    return (
      <RectButton
        onPress={() =>
          this.props.navigation.navigate('Detail', { id: sculptureId })
        }
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 12
          }}
        >
          <View style={[]}>
            <Image
              source={
                photoURL
                  ? { uri: photoURL, cache: 'force-cache' }
                  : images.empty_image
              }
              style={{
                width: 60,
                height: 60,
                borderRadius: 4,
                backgroundColor: palette.backgroundTabColor
              }}
            />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              paddingLeft: 12
            }}
          >
            <Text style={[styles.title, { fontSize: 14 }]}>
              {sculptureName}
            </Text>
            <Text
              style={[
                styles.description,
                { fontSize: 13, color: 'rgb(136,136,136)' }
              ]}
            >
              Visited time: {moment(submitDate).fromNow()}
            </Text>
          </View>
        </View>
      </RectButton>
    )
  }

  _renderList = () => {
    const { refreshing, visitList } = this.state
    return visitList.length ? (
      <FlatList
        data={visitList.sort((a, b) => {
          return (
            new Date(b.submitDate).getTime() - new Date(a.submitDate).getTime()
          )
        })}
        keyExtractor={(item, index) => index.toString()}
        renderItem={this._renderItem}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => (
          <DividerLight
            style={{ backgroundColor: 'rgba(0,0,0,0.15)', marginVertical: 0 }}
          />
        )}
        refreshControl={
          <RefreshControl
            colors={[palette.primaryColorLight]}
            refreshing={refreshing}
            onRefresh={this._handleRefresh}
            tintColor={palette.primaryColorLight}
          />
        }
      />
    ) : (
      <NoResultScreen title="No visits" />
    )
  }

  _handleRefresh = () => {
    this.setState(
      {
        refreshing: true
      },
      () =>
        this.setState({
          refreshing: false
        })
    )
  }

  render() {
    const { isLoading } = this.state
    return (
      <SafeAreaView style={styles.container}>
        <ListHeader headerName="Visits" />
        {isLoading ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              paddingTop: 12
            }}
          >
            <ActivityIndicator color={palette.primaryColorLight} size="small" />
          </View>
        ) : (
          this._renderList()
        )}
      </SafeAreaView>
    )
  }
}

const mapStateToProps = getState => ({
  username: getState.authReducer.user.username,
  userId: getState.authReducer.user.userId
})

export default connect(mapStateToProps)(VisitScreen)
