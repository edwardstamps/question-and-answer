import React, { Component } from 'react'
import './App.css'

export default class CustomButtons extends Component {
  render() {
    const task = this.props.task 
    const header = this.props.header 
    const approve = this.props.approve
    const block = this.props.block 
    const pin = this.props.pin
    
      if (header){
        return(
          <span style={{marginTop: 25}}>
            <span className='cellBoxRight'>
              <img className='button1' onClick={()=>this.sendApprove(task)} src={require('./icons/checkocircle.svg')} alt="approve"/>
              <img className='button1' onClick={()=>this.sendBlock(task)} src={require('./icons/deleteocircle.svg')} alt="block"/>
            </span>
          </span>
        )
      }
      
      if (approve){
        if (pin){
          return(
            <span style={{marginTop: 25}}>
              <span className='cellBoxRight'>
                <img className='button1' onClick={()=>this.sendAnswer(task)} src={require('./icons/check.svg')} alt="answered"/>
                <img className='button1' onClick={()=>this.sendBlock(task)} src={require('./icons/deleteocircle.svg')} alt="block"/>
              </span>
            </span>
          )
        }
        else {
          return(
            <span>
              <button className="pinButton" onClick={()=>this.sendPin(task)}><img className='pinImage' onClick={()=>this.sendPin(task)} src={require('./icons/thumbtack.svg')} alt="" />Pin to Top</button>
              <span className='cellBoxRight'>
                <img className='button1' onClick={()=>this.sendAnswer(task)} src={require('./icons/check.svg')} alt="answered"/>
                <img className='button1' onClick={()=>this.sendBlock(task)} src={require('./icons/deleteocircle.svg')} alt="block"/>
              </span>
            </span>
          )
        }
      }

      if (block){
        return(
          <span style={{marginTop: 25}}>
            <span className='cellBoxRight'>
              <img className='button1' onClick={()=>this.sendApprove(task)} src={require('./icons/checkocircle.svg')} alt="approve" />
              <img className='button1' src={require('./icons/deletecircle.svg')} alt="" />
            </span>
          </span>
        )
      }
    
    }
    sendApprove(task){
      this.props.makeApprove(task)
    }

    sendBlock(task){
      this.props.blockQuestion(task)
    }

    sendAnswer(task){
      this.props.makeAnswer(task)
    }

    sendPin(task){
      this.props.makePin(task)
    }
}
