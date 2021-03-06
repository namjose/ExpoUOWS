/**
 * Description: Comment Screen (Android platform)
 * Author: Nam Bui
 **/

import React from 'react'
import {
  SafeAreaView,
  View,
  Text,
  Keyboard,
  Animated,
  BackHandler,
  Image,
  TextInput
} from 'react-native'
import { connect } from 'react-redux'
import styles from './styles'
import { _handleNotification } from '../../library/notificationTask'
import CommentList from './CommentList'
import palette from '../../assets/palette'
import {
  addComment,
  deleteComment,
  editComment
} from '../../redux/actions/authActions'
import baseAxios from '../../library/api'
import InputKeyboard from './InputKeyboard'
import DeleteModal from './DeleteModal'
import {
  SCREEN_WIDTH,
  FIX_KEYBOARD_HEIGHT,
  FULL_SCREEN_HEIGHT,
  STATUS_BAR_HEIGHT,
  FULL_WINDOW_HEIGHT
} from '../../assets/dimension'
import SignInButton from '../../components/SignIn/SignInButton'
import ListHeader from '../../components/ListHeader/ListHeader'
import Modal from 'react-native-modal'
import BlackModal from '../../components/BlackModal/BlackModal'
import Header from '../Detail/Header.android'

const TEXT_INPUT_HEIGHT = 40

class CommentScreen extends React.PureComponent {
  state = {
    inputValue: '',
    inputHeight: new Animated.Value(TEXT_INPUT_HEIGHT),
    commentAfterId: null,
    comments: [],
    isLoading: true,
    refreshing: false,
    isModalOpen: false,
    selectedComment: null,
    isEdit: false,
    editing: false,
    isOverflowOpen: false,
    isDelete: false,
    isKeyboardOpenModal: false,
    modalVisible: false
  }

  inputRef = React.createRef()

  keyboardHeight = new Animated.Value(FULL_SCREEN_HEIGHT)

  setModalVisible = modalVisible => {
    this.setState({ modalVisible })
  }

  _handleRefresh = () => {
    this.setState(
      { refreshing: true, commentAfterId: null, isLoading: true },
      () => {
        this._fetchCommentSculpture()
      }
    )
  }

  _selectComment = (selectedComment, callback = () => {}) => {
    this.setState({ selectedComment }, () => {
      callback
    })
  }

  _openModal = () => {
    this.setState({ isModalOpen: true, isEdit: false })
  }

  _closeModal = () => {
    this.setState({ isModalOpen: false, selectedComment: null })
  }

  _focusTextInput = () => {
    this.setState({ isKeyboardOpenModal: true })
    this.inputRef.current.focus()
  }

  _blurTextInput = () => {
    this.setState({ isKeyboardOpenModal: false })
    this.inputRef.current.blur()
  }

  _handleEditComment = () => {
    const { comments, selectedComment } = this.state
    if (selectedComment) {
      const { text } = selectedComment
      setTimeout(() => {
        this.setState({ isKeyboardOpenModal: true })
        this.inputRef.current.focus()
        this.setState({ inputValue: text, isEdit: true })
      }, 600)
    }
  }

  _editComment = () => {
    const { comments, selectedComment, inputValue } = this.state
    this.setState({ editing: true, isLoading: true })

    baseAxios
      .patch('comment', {
        commentId: selectedComment.commentId,
        content: inputValue.trim()
      })
      .then(res => {
        const resData = res.data
        this.props.editComment(resData)
        this.setState({ commentAfterId: null }, () => {
          this._fetchCommentSculpture()
        })

        this.setState({ isOverflowOpen: true })
        setTimeout(() => {
          this.setState({
            isOverflowOpen: false,
            isEdit: false
            // selectedComment: null
          })
        }, 2000)
      })
      .catch(() => {
        console.log('Error! Can not edit comment!')
        this.setState({ commentAfterId: null }, () => {
          this._fetchCommentSculpture()
        })
      })
  }

  _deleteComment = () => {
    const { comments, selectedComment } = this.state
    if (selectedComment) {
      const { commentId } = selectedComment
      this.setState({
        isModalOpen: false,
        isOverflowOpen: true,
        isDelete: true,
        comments: comments.filter(element => element.commentId !== commentId),
        isLoading: true
      })

      setTimeout(() => {
        baseAxios
          .delete(`comment/${commentId}`)
          .then(() => {
            this.props.deleteComment(selectedComment.commentId)
            this.setState({ commentAfterId: null }, () => {
              this._fetchCommentSculpture()
            })
          })
          .catch(() => {
            console.log('Error! Cant not delete this comment!')
            this.setState({ commentAfterId: null }, () => {
              this._fetchCommentSculpture()
            })
          })
        this.setState({
          isOverflowOpen: false,
          isDelete: false
          // selectedComment: null
        })
      }, 2000)
    }
  }

  componentDidMount = () => {
    this._fetchCommentSculpture()
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.props.navigation.goBack()
      return true
    })
    this.keyboardDidShowSub = Keyboard.addListener(
      'keyboardDidShow',
      this.handleKeyboardDidShow
    )
    this.keyboardDidHideSub = Keyboard.addListener(
      'keyboardDidHide',
      this.handleKeyboardDidHide
    )
  }

  componentWillUnmount = () => {
    this.backHandler.remove()
    this.keyboardDidShowSub.remove()
    this.keyboardDidHideSub.remove()
  }

  handleChangeText = text => {
    this.setState({ inputValue: text })
  }

  handleKeyboardDidShow = event => {
    // console.log('keyboard height:', event.endCoordinates.height)
    const keyboardHeight = event.endCoordinates.height
    Animated.timing(this.keyboardHeight, {
      duration: 1,
      toValue: FULL_WINDOW_HEIGHT - keyboardHeight - 60 + 1
    }).start()
  }

  handleKeyboardDidHide = () => {
    this.setState({
      inputValue: '',
      isEdit: false,
      isKeyboardOpenModal: false
      // selectedComment: null
    })
    Animated.timing(this.keyboardHeight, {
      duration: 1,
      toValue: FULL_SCREEN_HEIGHT
    }).start()
  }

  _handleLoadMore = () => {
    const { comments, commentAfterId } = this.state
    if (commentAfterId !== comments[comments.length - 1].commentId) {
      // console.log('trigger')
      this.setState(
        {
          commentAfterId: comments[comments.length - 1].commentId,
          isLoading: true
        },
        () => {
          this._fetchCommentSculpture()
        }
      )
    }
  }

  _fetchCommentSculpture = () => {
    const { commentAfterId } = this.state
    const sculptureId = this.props.navigation.getParam('id', 'unknown1')
    baseAxios
      .get(
        `comment/sculpture-id/${sculptureId}?${
          commentAfterId ? `after=${commentAfterId}` : ''
        }&limit=10`
      )
      .then(res => res.data)
      .then(resData => {
        const comments = resData.map(element => {
          const {
            commentId,
            content,
            user: { userId, picture, name, nickname },
            sculpture: { accessionId, images },
            createdTime
          } = element
          return {
            commentId,
            text: content,
            userId,
            userImg: picture,
            userName: userId.includes('auth0') ? nickname : name,
            sculptureId: accessionId,
            photoURL: images.length ? images[0].url : null,
            submitDate: createdTime
          }
        })
        this.setState({
          comments: commentAfterId
            ? [...this.state.comments, ...comments]
            : comments,
          isLoading: false,
          editing: false,
          refreshing: false
        })
      })
      .catch(e => {
        console.log(e)
        this.setState({
          isLoading: true,
          editing: false,
          refreshing: false
        })
      })
  }

  _onSubmit = () => {
    const sculptureId = this.props.navigation.getParam('id', 'unknown1')
    const { user } = this.props
    const { inputValue, isEdit, selectedComment } = this.state
    if (isEdit && selectedComment) {
      const { text } = selectedComment
      if (inputValue.trim() !== text) {
        this._editComment()
      }
    } else {
      const postingComment = {
        userId: user.userId,
        userImg: user.picture,
        userName: user.username,
        sculptureId,
        text: inputValue.trim()
      }
      this.setState({
        isLoading: true,
        comments: [postingComment, ...this.state.comments]
      })
      baseAxios
        .post('comment', {
          sculptureId,
          content: inputValue.trim()
        })
        .then(res => res.data)
        .then(resData => {
          this.props.addComment(resData)
          this.setState({ commentAfterId: null }, () =>
            this._fetchCommentSculpture()
          )
        })
        .catch(() => 'Can not add comment')
    }

    this.setState({ inputValue: '' })
    Keyboard.dismiss()
  }

  render() {
    const {
      inputValue,
      inputHeight,
      comments,
      isLoading,
      isModalOpen,
      isEdit,
      editing,
      refreshing,
      isOverflowOpen,
      selectedComment,
      isDelete,
      isKeyboardOpenModal
    } = this.state
    const {
      user: { picture },
      loggedIn
    } = this.props
    const id = this.props.navigation.getParam('id', 'unknown1')
    const item = this.props.markerMatrix[id]
    const { imageList } = item

    return (
      <SafeAreaView style={styles.container}>
        <BlackModal
          isVisible={isKeyboardOpenModal}
          onPress={this._blurTextInput}
        />
        <Header
          modalVisible={this.state.modalVisible}
          setModalVisible={this.setModalVisible}
          item={item}
          imageList={imageList}
          disable={isLoading || isOverflowOpen}
        />
        <CommentList
          _focusTextInput={this._focusTextInput}
          _handleLoadMore={this._handleLoadMore}
          refreshing={refreshing}
          _handleRefresh={this._handleRefresh}
          _handleEditComment={this._handleEditComment}
          _selectComment={this._selectComment}
          _openModal={this._openModal}
          comments={comments}
          navigation={this.props.navigation}
          isLoading={isLoading}
          editing={editing}
          loggedIn={loggedIn}
        />

        {isOverflowOpen && (
          <View
            style={{
              backgroundColor: palette.alertModalCommentColor,
              paddingHorizontal: 24,
              paddingVertical: 16,
              flexDirection: 'row',
              top: FULL_WINDOW_HEIGHT * 0.4,
              position: 'absolute',
              zIndex: 10
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: '#FFF' }]}>
                {!isDelete ? 'Comment edited' : 'Comment deleted'}
              </Text>
            </View>
          </View>
        )}
        {loggedIn ? (
          <InputKeyboard
            keyboardHeight={this.keyboardHeight}
            isEdit={isEdit}
            editing={editing}
            ref={this.inputRef}
            picture={picture}
            inputHeight={inputHeight}
            inputValue={inputValue}
            _onSubmit={this._onSubmit}
            handleChangeText={this.handleChangeText}
            selectedComment={selectedComment}
          />
        ) : (
          <View
            style={{
              backgroundColor: '#fff',
              alignItems: 'center',
              position: 'absolute',
              width: SCREEN_WIDTH,
              elevation: 20,
              bottom: 0
            }}
          >
            <Text
              style={[
                styles.title,
                { fontSize: 14, marginBottom: 12, marginTop: 10 }
              ]}
            >
              Sign in to comment
            </Text>
            <SignInButton />
          </View>
        )}
        <DeleteModal
          isModalOpen={isModalOpen}
          _closeModal={this._closeModal}
          _deleteComment={this._deleteComment}
        />
      </SafeAreaView>
    )
  }
}

const mapStateToProps = getState => ({
  markerMatrix: getState.markerReducer.markerMatrix,
  user: getState.authReducer.user,
  loggedIn: getState.authReducer.loggedIn
})

const mapDispatchToProps = {
  addComment,
  deleteComment,
  editComment
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommentScreen)
