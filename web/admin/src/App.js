import React, { Component } from 'react'
import './App.css'
import Modal  from 'react-modal'
import ReactDOM from 'react-dom'
import client, {Color} from '@doubledutch/admin-client'
import FirebaseConnector from '@doubledutch/firebase-connector'
import CustomModal from './modal'
import { CustomCell } from './cell'
import ModIcon from './modicon'
import { CustomHeader } from './header';
import CustomHeaderOff from './headeroff';
import CustomButtons from './buttons';
const fbc = FirebaseConnector(client, 'questionanswer')
fbc.initializeAppWithSimpleBackend()

export default class App extends Component {
  constructor() {
    super()
    this.state = { 
      value: '', 
      session: 'All',
      question: '', 
      vote: '', 
      questions: [], 
      sessions: [], 
      showRecent: false,
      modalVisible: false, 
      anom: false, 
      color: 'white',
      marginTop: 18, 
      moderator: [], 
      showBlock: false, 
      showAnswer: false, 
      newQuestions: 0, 
      openVar: false}
    this.signin = fbc.signinAdmin()
      .then(user => this.user = user)
      .catch(err => console.error(err))
  }
  componentDidMount() {
    this.signin.then(() => {
      const questionsRef = fbc.database.public.allRef('questions')
      const votesRef = fbc.database.public.allRef('votes')
      const modRef = fbc.database.public.allRef('moderators')
      const sessRef = fbc.database.public.allRef('sessions')

      sessRef.on('child_added', data => {
        this.setState({ sessions: [...this.state.sessions, {...data.val(), key: data.key }] })
      })
    
      modRef.on('child_added', data => {
        this.setState({ moderator: [...this.state.moderator, {...data.val(), key: data.key }] })
      })

      modRef.on('child_changed', data => {
        var moderator = this.state.moderator
        for (var i in moderator) {
          if (moderator[i].key === data.key) {
            moderator[i] = data.val()
            moderator[i].key = data.key
            this.setState({moderator})
          }
        }
      })    

      questionsRef.on('child_added', data => {
        this.setState({ questions: [...this.state.questions, {...data.val(), key: data.key }] })
        fbc.database.public.allRef('votes').child(data.key).on('child_added', vote => {
          var userVote = false
          if (vote.key === client.currentUser.id){
            userVote = true
          }
          var questions = this.state.questions.map(question => 
            question.key === data.key ?
            { ...question, myVote: userVote, score: question.score + 1}
            : 
            question
          )
          this.setState({questions})
        })
        fbc.database.public.allRef('votes').child(data.key).on('child_removed', vote => {
          var userVote = true
          if (vote.key === client.currentUser.id){
            userVote = false
          }
          var questions = this.state.questions.map(question => 
            question.key === data.key ?
            { ...question, myVote: userVote, score: question.score - 1}
            : 
            question
          )
          this.setState({questions})
        })
      })

      questionsRef.on('child_removed', data => {
        this.setState({ questions: this.state.questions.filter(x => x.key !== data.key) })
      })

      questionsRef.on('child_changed', data => {
        var questions = this.state.questions
        for (var i in questions){
          if (questions[i].key === data.key) {
            questions[i] = data.val()
            questions[i].key = data.key
            this.setState({questions})
          }
        }
      })
    })
  }

  render() {
    const { questions, showRecent, marginTop, moderator, showAnswer, sessions } = this.state 
    const time = new Date().getTime()
    questions.sort(function (a,b){
      return b.dateCreate - a.dateCreate
    })
    var newQuestions = questions
    if (this.state.session !== 'All'){
      newQuestions = questions.filter(question => question.session === this.state.session)
    }

    return (
    <div className="App">
      <CustomModal
      openVar = {this.state.openVar}
      afterOpenModal = {this.afterOpenModal}
      closeModal = {this.closeModal}
      newSession = {this.newSession}
      />
      <div className="topBox">
        <p className='bigBoxTitle'>{'Q & A'}</p>
        <button className="qaButton" onClick={this.openModal}>Add QA Session</button>
      </div>
      <div className="container">
        {this.renderLeft(newQuestions, time, sessions)}
        {this.renderRight(newQuestions, time)}
      </div>
    </div>
    )
  }

  renderLeft = (questions, time, sessions) => {
    var totalQuestions = questions.filter(item => item.approve === false && item.new === true)
    if (totalQuestions === undefined){
      totalQuestions = ['']
    }
    var header = true
    if (this.state.moderator.length > 0) {
      if (this.state.moderator[0].approve === true) {
        return (
        <div className="questionContainer">
          <span className="buttonSpan">
            <p className='boxTitle'>New Questions ({totalQuestions.length})</p>
            <span className="spacer"/>
            <p className='boxTitle'>Moderation:   </p>
            <ModIcon
            moderator = {this.state.moderator}
            offApprove = {this.offApprove}
            onApprove = {this.onApprove}
            />
            <p className="dropdownTitle">View: </p>
            
            <form className="dropdownMenu" onSubmit={this.handleSubmit}>
              <select className="dropdownText" value={this.state.session} name="session" onChange={this.handleChange}>
              <option style={{textAlign: "center"}}value="All">{'\xa0\xa0'}All Sessions</option>
              { sessions.map(task => {
                return (
                <option key={task.key} value={task.sessionName}>{'\xa0\xa0' + task.sessionName}</option>  
                )      
              })
              }
              </select>
            </form> 
          </span>
          <span className="questionBox">
            <ul className='listBox'>
              { questions.map(task => {
                if (task.new === true){
                  var difference = this.doDateMath(task.dateCreate, time)
                  return (
                    <li className='cellBox' key={task.key}>
                      <CustomCell
                      task = {task}
                      difference = {difference}
                      />
                      <CustomButtons
                      task = {task}
                      header = {header}
                      makeApprove = {this.makeApprove}
                      blockQuestion = {this.blockQuestion}
                      makePin = {this.makePin}
                      makeAnswer = {this.makeAnswer}
                      />
                    </li>
                  )
                }
              })
              }
            </ul>
            <button className="answerButton" onClick={this.openModal}>Remove All</button>
          </span>
        </div>
        )
      }
      else {
        return(
        <div className="questionContainer">
          <span className="buttonSpan">
            <p className='boxTitle'>New Questions ({totalQuestions.length})</p>
            <span className="spacer"/>
            <p className='boxTitle'>Moderation:   </p>
            <ModIcon
            moderator = {this.state.moderator}
            offApprove = {this.offApprove}
            onApprove = {this.onApprove}
            />
            <p className="dropdownTitle">View: </p>   
            <form className="dropdownMenu" onSubmit={this.handleSubmit}>
              <select className="dropdownText" value={this.state.session} name="session" onChange={this.handleChange}>
              <option style={{textAlign: "center"}}value="All">{'\xa0\xa0'}All Sessions</option>
              { sessions.map(task => {
                return (
                <option key={task.key} value={task.sessionName}>{'\xa0\xa0' + task.sessionName}</option>  
                )      
              })
              }
              </select>
            </form> 
          </span>
          <span className="questionBox">
            <div className="modTextBox">
              <p className="bigModText">Moderation is turned off</p>
              <p className="smallModText">All submitted questions will appear in the</p>
              <p className="smallModText">approved questions list</p>
            </div>
          </span>
        </div>
        )
      }
    }

    else{
      return(
        <div className="questionContainer">
          <span className="buttonSpan">
            <p className='boxTitle'>New Questions ({totalQuestions.length})</p>
            <span className="spacer"/>
              <p className='boxTitle'>Moderation:   </p>
              <ModIcon
              moderator = {this.state.moderator}
              offApprove = {this.offApprove}
              onApprove = {this.onApprove}
              />
              <p className="dropdownTitle">View: </p>
              <form className="dropdownMenu" onSubmit={this.handleSubmit}>
                <select className="dropdownText" value={this.state.session} name="session" onChange={this.handleChange}>
                <option style={{textAlign: "center"}}value="All">{'\xa0\xa0'}All Sessions</option>
                { sessions.map(task => {
                  return (
                  <option key={task.key} value={task.sessionName}>{'\xa0\xa0' + task.sessionName}</option>  
                  )      
                })
                }    
                </select>
              </form> 
            </span>
            <span className="questionBox">
              <div className="modTextBox">
                <p className="bigModText">Create a Session to Start QA</p>
                <p className="smallModText">All submitted questions will appear below</p>
              </div>
            </span>
        </div>
      )
    }
  }

  renderBlocked = (questions, time) => {
    return(
    <span className="questionBox2">
      <ul className="listBox">
        { questions.map(task => {
          if (task.approve === false && task.block === true){
            var block = true
            var header = false
            var difference = this.doDateMath(task.dateCreate, time)
            return (
            <li className='cellBox' key={task.key}>
              <CustomCell
              task = {task}
              difference = {difference}
              />
              <CustomButtons
              task = {task}
              block = {block}
              makeApprove = {this.makeApprove}
              blockQuestion = {this.blockQuestion}
              makePin = {this.makePin}
              makeAnswer = {this.makeAnswer}
              />
            </li>
            )
          }
        }) 
        }
      </ul>
    </span>
    )
  }

  renderAnswered = (questions, time) => {
    return (
      <span className="questionBox2">
        <ul className="listBox">
          { questions.map(task => {
            if (task.answered === true){
              var difference = this.doDateMath(task.dateCreate, time)
              return (
              <li className='cellBox' key={task.key}>
                <CustomCell
                task = {task}
                difference = {difference}
                />
              </li>
              )
            }
          }) 
          }
        </ul>
      </span>
    )
  }
  

  renderPinned = (questions, time) => {
    return (
    <span>
      { questions.map(task => {
        if (task.pin === true){
          var pin = true
          var approve = true
          var difference = this.doDateMath(task.dateCreate, time)
          return (
          <li className='cellBox' key={task.key}>
            <CustomCell
            task = {task}
            difference = {difference}
            />
            <CustomButtons
            task = {task}
            pin = {pin}
            approve = {approve}
            makeApprove = {this.makeApprove}
            blockQuestion = {this.blockQuestion}
            makePin = {this.makePin}
            makeAnswer = {this.makeAnswer}
            />
          </li>
          )
        }
      })
      }
    </span>
    )
  }

  renderRight = (questions, time) => {
    if (this.state.moderator.length > 0){
      if (this.state.moderator[0].approve === false){
        if (this.state.showBlock === false && this.state.showAnswer === false){
          var approve = true
          return(
          <div className="questionContainer">
            <CustomHeaderOff
            questions = {questions}
            handleClick = {this.handleClick}
            handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll}
            showBlock = {this.state.showBlock}
            showAnswer = {this.state.showAnswer}
            handleApproved = {this.handleApproved}
            />
            <span className="questionBox2">
              <ul className="listBox">
                {this.renderPinned(questions, time)}
                { questions.map(task => {
                  if (task.block === false && task.pin === false && task.answered === false){
                    var difference = this.doDateMath(task.dateCreate, time)
                    return (
                    <li className='cellBox' key={task.key}>
                      <CustomCell
                      task = {task}
                      difference = {difference}
                      />
                      <CustomButtons
                      task = {task}
                      approve = {approve}
                      makeApprove = {this.makeApprove}
                      blockQuestion = {this.blockQuestion}
                      makePin = {this.makePin}
                      makeAnswer = {this.makeAnswer}
                      />
                    </li>
                    )
                  }
                })
                }
              </ul>
            </span>
          </div>
          )
        }

        if (this.state.showAnswer === true){
          var block = false
          var header = false
          return(
          <div className="questionContainer">
            <CustomHeaderOff
            questions = {questions}
            handleClick = {this.handleClick}
            handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll}
            showBlock = {this.state.showBlock}
            showAnswer = {this.state.showAnswer}
            handleApproved = {this.handleApproved}
            />
            {this.renderAnswered(questions, time)}
          </div>
          )
        }
        
        else {
          return(
          <div className="questionContainer">
            <CustomHeaderOff
            questions = {questions}
            handleClick = {this.handleClick}
            handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll}
            showBlock = {this.state.showBlock}
            showAnswer = {this.state.showAnswer}
            handleApproved = {this.handleApproved}
            />
            {this.renderBlocked(questions, time)}
          </div>
          )
        }
      }

      if (this.state.moderator[0].approve === true){
        if (this.state.showBlock === false && this.state.showAnswer === false){
          var approve = true
          return(
          <div className="questionContainer">
            <CustomHeader
            questions = {questions}
            handleClick = {this.handleClick}
            handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll}
            showBlock = {this.state.showBlock}
            showAnswer = {this.state.showAnswer}
            />
            <span className="questionBox2">
              <ul className="listBox">
              {this.renderPinned(questions, time)}
                 { questions.map(task => {
                  if (task.approve === true && task.block === false && task.pin === false & task.answered === false){
                    var block = false
                    var header = false
                    var pin = false
                    var difference = this.doDateMath(task.dateCreate, time)
                    return (
                    <li className='cellBox' key={task.key}>
                      <CustomCell
                      task = {task}
                      difference = {difference}
                      />
                      <CustomButtons
                      task = {task}
                      approve = {approve}
                      makeApprove = {this.makeApprove}
                      blockQuestion = {this.blockQuestion}
                      makePin = {this.makePin}
                      makeAnswer = {this.makeAnswer}
                      />
                    </li>
                    )
                  }
                })
                }
              </ul>
            </span>
          </div>
          )
        }

        if (this.state.showAnswer === true){
          var block = false
          var header = false
          return(
          <div className="questionContainer">
            <CustomHeader
            questions = {questions}
            handleClick = {this.handleClick}
            handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll}
            showBlock = {this.state.showBlock}
            showAnswer = {this.state.showAnswer}
            handleApproved = {this.handleApproved}
            />
            {this.renderAnswered(questions, time)}
          </div>
          )
        }
        else {
          return(
          <div className="questionContainer">
            <CustomHeader
            questions = {questions}
            handleClick = {this.handleClick}
            handleAnswer = {this.handleAnswer}
            answerAll = {this.answerAll}
            showBlock = {this.state.showBlock}
            showAnswer = {this.state.showAnswer}
            handleApproved = {this.handleApproved}
            />
            {this.renderBlocked(questions, time)}
          </div>
          )
        }
      }
    }

    else {
      return(
        <div className="questionContainer">
          <CustomHeader
          questions = {questions}
          handleClick = {this.handleClick}
          handleAnswer = {this.handleAnswer}
          answerAll = {this.answerAll}
          showBlock = {this.state.showBlock}
          showAnswer = {this.state.showAnswer}
          handleApproved = {this.handleApproved}
          />
          {this.renderBlocked(questions, time)}
        </div>
      )
    }
  }

  doDateMath = (date, time) => {
    var difference = Math.floor((time - date) / (1000*60))
    if (difference < 60) {
      difference = difference
      if (difference === 1) {
        return difference = difference + " minute ago"
      }
      if (difference > 1) {
        return difference = difference + " minutes ago"
      }
    }
    if (difference > 60) {
      difference = Math.floor(difference / 60) 
      if (difference === 1) {
        return difference = difference + " hour ago"
      }
      if (difference > 1) {
        return difference = difference + " hours ago"
      }
    }
    if (difference > 1440) {
      difference = Math.floor(difference / 1440) 
      if (difference === 1) {
        return difference = difference + " day ago"
      }
      if (difference > 1) {
        return difference = difference + " days ago"
      }
    }
    else {
      return difference = "0 minutes ago"
    }
  }

  handleClick = () => {
    this.setState({
      showAnswer: false,
      showBlock: true
    })
  }


  handleAnswer = () => {
    this.setState({
      showAnswer: true,
      showBlock: false
    })
  }

  handleApproved = () => {
    this.setState({
      showAnswer: false,
      showBlock: false
    })
  }

  openModal = () => {
    this.setState({openVar: true});
  }


  closeModal = () => {
    this.setState({openVar: false});
  }

  handleChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit = (event) => {
  }

  newSession = (newSession) =>  {
    if (this.state.moderator.length === 0){
      fbc.database.public.allRef('moderators').push({"approve": false})
    }
    fbc.database.public.allRef('sessions').push({sessionName: newSession})
  }

  onApprove = () => {
    if (this.state.moderator.length === 0) {
      fbc.database.public.allRef('moderators').push({"approve": true})
    }
    else {
      var mod = this.state.moderator[0]
      fbc.database.public.allRef('moderators').child(mod.key).update({"approve": true})
    }
  }

  makeSession = (text) => {
    fbc.database.public.allRef('sessions').set({"sessionID": text})
  }

  offApprove = () => {
    var mod = this.state.moderator[0]
    // mod.approve = false
    fbc.database.public.allRef('moderators').child(mod.key).update({"approve": false})
  }

  makeApprove = (question) => {
    var time = new Date().getTime()
    fbc.database.public.allRef('questions').child(question.key).update({"approve": true, 'block': false, 'new': false, 'lastEdit': time})
  }

  makePin = (question) => {
    var pinned = this.state.questions.filter(task => task.pin === true)
    if (pinned.length < 3){
      fbc.database.public.allRef('questions').child(question.key).update({"pin": true, "approve": true, 'block': false, 'new': false})
    }
  }

  makeAnswer = (question) => {
    fbc.database.public.allRef('questions').child(question.key).update({"answered": true, 'block': false, 'new': false, 'pin': false})
  }

  blockQuestion = (question) => {
    fbc.database.public.allRef('questions').child(question.key).update({"block": true, 'approve': false, 'new': false, 'pin': false})
  }

  answerAll = () => {
    const questions = this.state.questions
    if (questions !== undefined) {
      questions.map(question => {
        if (question.block !== true){
        fbc.database.public.allRef('questions').child(question.key).update({"answered": true, 'new': false, 'pin': false})
        }
      })
    }
  }

}





