import { StyleSheet, Dimensions } from 'react-native'
import palette from '../../assets/palette'
import { BUTTON_HEIGHT, SCREEN_WIDTH } from '../../assets/dimension'
import { shadowIOS } from '../../assets/rootStyles'

const { width, height } = Dimensions.get('window')

const shadowStyle = {
  elevation: 4,
  shadowColor: '#000000',
  shadowOffset: {
    width: 0,
    height: 3
  },
  shadowRadius: 5,
  shadowOpacity: 0.1
}

const dot = {
  backgroundColor: 'rgba(185,185,185,.2)',
  width: 5,
  height: 5,
  borderRadius: 10,
  margin: 3
}

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.backgroundColorWhite
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 24,
    zIndex: 1
  },
  overlayImage: {
    position: 'absolute',
    paddingHorizontal: 24,
    paddingVertical: 7,
    bottom: 0,
    height: 60,
    width: '100%',
    // borderBottomRightRadius: 12,
    // borderBottomLeftRadius: 12,
    justifyContent: 'flex-end',
    zIndex: 10
  },
  headerImage: {
    flex: 1
    // borderBottomRightRadius: 12,
    // borderBottomLeftRadius: 12,
    // backgroundColor: palette.backgroundColorWhite,
    // ...shadowStyle,
    // elevation: 10
  },
  imageItem: {
    width: width,
    height: height * 0.4,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6'
  },
  detailContainer: {
    flexDirection: 'column-reverse'
  },
  card: {
    flex: 1,
    padding: 24,
    backgroundColor: palette.backgroundColorWhite,
    borderBottomRightRadius: 12,
    borderBottomLeftRadius: 12,
    marginTop: -5,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 0.1
  },
  contentBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textInputContainer: {
    paddingTop: 18
  },
  textInputOutlined: {
    borderBottomWidth: 1,
    borderBottomColor: palette.secondaryTypographyColor,
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    color: palette.primaryColor,
    fontFamily: 'Montserrat-SemiBold'
  },
  textInputTitle: {
    fontSize: 12,
    color: palette.secondaryTypographyStrongColor,
    fontFamily: 'Montserrat-SemiBold'
  },
  textInputTitle__alert: {
    fontSize: 12,
    color: palette.secondaryColor,
    fontFamily: 'Montserrat-SemiBold'
  },
  flatListHeader: {
    fontSize: 16,
    fontFamily: 'Montserrat-Bold',
    color: palette.primaryColor
  },
  alt_description: {
    fontSize: 14,
    color: palette.primaryColorLight,
    fontFamily: 'Montserrat-Medium'
  },
  description: {
    fontSize: 12,
    color: palette.secondaryTypographyColor,
    fontFamily: 'Montserrat-Medium'
  },
  description_cmt: {
    fontSize: 12,
    color: palette.primaryColor,
    fontFamily: 'Montserrat-Medium'
  },
  numberStyle: {
    fontSize: 12,
    color: palette.primaryColor,
    fontFamily: 'Montserrat-SemiBold',
    paddingLeft: 5
  },
  visitorsText: {
    opacity: 0.75,
    fontSize: 12,
    color: palette.backgroundColorWhite,
    fontFamily: 'Montserrat-SemiBold'
  },
  button: {
    backgroundColor: palette.primaryColorLight,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    // marginVertical: 10,
    minHeight: BUTTON_HEIGHT,
    padding: 4,
    flex: 1,
    borderColor: palette.primaryColorLight,
    borderWidth: 0.5
    // ...shadowStyle
  },
  titleButton: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: palette.backgroundColorWhite,
    textAlign: 'center'
  },
  activeDot: {
    ...dot,
    backgroundColor: palette.backgroundColorWhite
  },
  dot,
  blackFullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000'
  },
  socialIconStyle: {
    width: 22
    // paddingHorizontal: 4,
    // marginRight: -4,
  },
  menuText: {
    fontSize: 14,
    fontFamily: 'Montserrat-SemiBold',
    color: palette.primaryColorLight
  },
  menuTextLg: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: palette.primaryColorLight
  },
  box: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    height: BUTTON_HEIGHT,
    paddingHorizontal: 15,
    backgroundColor: palette.primaryColorLight,
    borderWidth: 1,
    borderColor: palette.primaryColorLight,
    borderRadius: 12
  },
  //menu IOS style
  iosMenuStyle: {
    // position: 'absolute',
    // bottom: 0,
    width: SCREEN_WIDTH,
    backgroundColor: '#FFF',
    // paddingHorizontal: 24,
    ...shadowIOS
  }
})
