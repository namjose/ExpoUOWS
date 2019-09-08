import React from 'react'
import { View, Text, TouchableNativeFeedback } from 'react-native'
import { connect } from 'react-redux'
import { icons } from '../../assets/icons'
import styles from './styles'
import palette from '../../assets/palette'
import { insertSearchItem } from '../../redux/actions'

const SearchItem = ({
  item,
  searchText,
  _navigateToDetail,
  insertSearchItem
}) => {
  const animatedName = item.name.slice(0, searchText.length)
  const originalName = item.name.slice(searchText.length, item.name.length)
  const onItemClick = () => {
    _navigateToDetail(item.id)
    insertSearchItem(item)
  }
  return (
    <TouchableNativeFeedback
      style={{
        flex: 1
      }}
      onPress={() => onItemClick()}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 5
          // paddingHorizontal: 18
        }}
      >
        <View
          style={{
            alignItems: 'center',
            paddingTop: 8,
            width: 50
          }}
        >
          {item.recent ? icons.clock : icons.marker_fill_w}
          <Text style={styles.distance}>{!item.recent && item.distance}</Text>
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 12,
            paddingBottom: item.recent ? 6 : 0
          }}
        >
          <Text style={[styles.title]}>
            <Text
              style={[
                styles.title,
                { color: palette.secondaryTypographyColor }
              ]}
            >
              {animatedName}
            </Text>
            {originalName}
          </Text>
          {!item.recent && (
            <Text style={[styles.description]}>{item.features.maker}</Text>
          )}
        </View>
        <View
          style={{
            width: 50,
            alignItems: 'flex-end',
            padding: 10,
            paddingRight: 5 //icons error, so padding = default padding / 2
          }}
        >
          {icons.noun_arrow}
        </View>
      </View>
    </TouchableNativeFeedback>
  )
}
const mapDispatchToProps = {
  insertSearchItem
}

export default connect(
  null,
  mapDispatchToProps
)(SearchItem)
