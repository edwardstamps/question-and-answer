'use strict'
import React, { Component } from 'react'
import ReactNative, {
  Platform, TouchableOpacity, Text, TextInput, View, ScrollView, FlatList, Modal, Image
} from 'react-native'
import client, { Avatar, TitleBar, Color } from '@doubledutch/rn-client'

export default class FilterSelect extends Component {
  constructor(props){
    super(props)
    this.state = {
      sortList: ["New", "Approved", "Blocked", "Answered"],
      sortListUser: ["Popular", "Answered", "Recent"],
      search: false
    }
  }

  render() { 
    return (
      <View style={{flex:1, backgroundColor: 'white'}}>
        {this.topicsHeader()}
        {this.sortTable()}
      </View>
    )
  }



  sortTable = () => {
  const tableData = this.props.openAdminHeader ? this.state.sortList : this.state.sortListUser
   return (
      <View style={s.table}>
        {tableData.map((item, i) => {
          return (
            <TouchableOpacity style={s.row} key={i} onPress={() => this.onSortChange(item)}>
              <Text style={((item === this.props.currentSort) ? s.rowTextHighlight: s.rowText)}>{item}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  topicsHeader = () => {
    return (
      <View style={s.buttonContainer}>
        <TouchableOpacity onPress={() => this.props.handleChange("showFilterSelect", false)}>
          <Text style={s.closeButton}>X</Text>
        </TouchableOpacity>
        <Text style={s.title}>Lists</Text>
        <Text style={{width: 25}}></Text>
      </View>
    )
  }

  onSortChange = (item) => {
    if (this.props.currentSort !== item) {
      if (item === "Recent") this.props.findOrderDate()
      else this.props.findOrder()
      this.props.handleChange("currentSort", item)
    }
  }


}

const fontSize = 18
color: 
const s = ReactNative.StyleSheet.create({
  table: {
    flexDirection: "column",
  },
  row: {
    paddingTop: 20,
    paddingBottom: 20,
    marginRight: 20,
    marginLeft: 20,
    borderBottomWidth: 1,
    borderColor: '#EFEFEF'
  },
  rowText: {
    fontSize: 20,
    color: "#404040"
  },
  rowTextHighlight: {
    fontSize: 20,
    color: client.primaryColor
  },
  buttonContainer: {
    flexDirection: 'row',
    height: 60,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: '#EFEFEF'
  },
  title: {
    fontSize: 24,
    flex: 1,
    textAlign: 'center',
    color: '#9B9B9B'
  },
  closeButton: {
    marginLeft: 5,
    color: client.primaryColor,
    padding: 15
  }
})
