import React, { Component } from 'react';
import Timer from '../node_modules/react-timer-component/lib/Timer'
import PropTypes from '../node_modules/prop-types'
import logo from './logo.svg';
import './App.css';
import './css/font-awesome.css';

var possibleCombinationSum = (arr, n) => {
  if (arr.indexOf(n) >= 0) { return true; }
  if (arr[0] > n) { return false; }
  if (arr[arr.length - 1] > n) {
    arr.pop();
    return possibleCombinationSum(arr, n);
  }
  var listSize = arr.length, combinationsCount = (1 << listSize)
  for (var i = 1; i < combinationsCount ; i++ ) {
    var combinationSum = 0;
    for (var j=0 ; j < listSize ; j++) {
      if (i & (1 << j)) { combinationSum += arr[j]; }
    }
    if (n === combinationSum) { return true; }
  }
  return false;
};

const Stars = (props) => {
  let stars = [];
  for(let i=0; i<props.numberOfStars; i++) {
    stars.push(<i key={i} className='fa fa-star'></i>);
  }
  return(
    <div className='col-5'>
        {stars}
    </div>
  );
};

const Button = (props) => {
  let button;
  switch(props.answerIsCorrect){
      case true:
      button = 
      <button className='btn btn-success'
              onClick={props.acceptAnswer}>
      <i className='fa fa-check'></i>
      </button>
      break;
      case false:
      button = 
      <button className='btn btn-danger'>
      <i className='fa fa-times'></i> 
      </button>
      break;
      default:
      button = 
      <button className='btn' 
              onClick={props.checkAnswer}
              disabled={props.selectedNumbers.length === 0}>
      =
      </button>
      break;
  }
  return(
    <div className='col-2 text-center'>
        {button}
        <br/><br/>
        <button className='btn btn-warning btn-sm' onClick={props.redraw}>
          <i className='fa fa-refresh'></i>{props.redraws}
        </button>
    </div>
  );
};

const Answer = (props) => {
  return(
    <div className='btn'>
        {props.selectedNumbers.map((number, i) => 
          <span key={i}
          onClick={() => props.unselectNumber(number)}>{number}</span>
        )}
    </div>
  );
};

const Numbers = (props) => {
  //const arrayOfNumbers = [1,2,3,4,5,6,7,8,9];
  const numberClassName = (number) => {

    if(props.usedNumbers.indexOf(number) >= 0){
      return 'used';
    }
    if(props.selectedNumbers.indexOf(number) >= 0){
      return 'selected';
    }

  }
  return(
    <div className='card text-center'>
        <div>
          {Numbers.list.map((number, i) => 
            <span key={i} className={numberClassName(number)}
              onClick={() => props.selectNumber(number)}>
              {number}
            </span>
          )}
        </div>
    </div>
  );
};

const DoneFrame = (props) =>{
  return(
  <div className='text-center'>
    <h2>{props.doneStatus}</h2>
    <button className='btn btn-secondary' onClick={() => props.playAgain()}>Play Again </button>
  </div>);
};

const Countdown = (props, context) => {
  const d = new Date(context.remaining);
  const {seconds} = {
    seconds: d.getUTCSeconds(),
  };
  //props.elapsedSec();
  return (
    <p>{seconds}</p>
  );
};

Countdown.contextTypes = {
  remaining: PropTypes.number,
};

Numbers.list = [1,2,3,4,5,6,7,8,9];

class Game extends Component{
  static randomNumber = () => 1 + Math.floor(Math.random()*9);
  static initialState = () => ({
    selectedNumbers: [],
    randomNumberOfStars: Game.randomNumber(),
    usedNumbers:[],
    answerIsCorrect: null,
    redraws:5,
    doneStatus: null,
    secondsElapsed:60000,
  });
  
  state = Game.initialState();
  playAgain = () => this.setState(Game.initialState());

  selectNumber = (clickedNumber) => {
    if(this.state.selectedNumbers.indexOf(clickedNumber) >= 0 ) { return; }
    if(this.state.usedNumbers.indexOf(clickedNumber) >= 0 ) { return; }
    this.setState(prevState => ({
      answerIsCorrect: null,
      selectedNumbers : prevState.selectedNumbers.concat(clickedNumber)
    }));
  };

  unselectNumber = (clickedNumber) => {
    this.setState(prevState => ({
      answerIsCorrect: null,
      selectedNumbers : prevState.selectedNumbers.filter(number => number !== clickedNumber)
    }));
  };

  tick = () => {
    if(this.state.secondsElapsed < 1000) return;
    this.setState({secondsElapsed: this.state.secondsElapsed - 1000}, this.updateDoneStatus);
  }

  componentDidMount = () => {
    this.interval = setInterval(this.tick, 1000);
  }

  componentWillUnmount = () => {
    clearInterval(this.interval);
  }

  checkAnswer = () => {
    this.setState(prevState => ({
      answerIsCorrect: prevState.randomNumberOfStars ===
      prevState.selectedNumbers.reduce((acc, n) => acc + n, 0)
    }));
  };

  redraw = () => {
    if(this.state.redraws === 0) {return;}
    this.setState(prevState => ({
    randomNumberOfStars: Game.randomNumber(),
    answerIsCorrect: null,
    selectedNumbers: [],
    redraws: prevState.redraws - 1,
    }), this.updateDoneStatus);
  };

  possibleSolutions = ({randomNumberOfStars,usedNumbers}) => {
    const possibleNumbers = [1,2,3,4,5,6,7,8,9].filter(number => 
      usedNumbers.indexOf(number) === -1);
    return possibleCombinationSum(possibleNumbers,randomNumberOfStars);  
  };

  updateDoneStatus = () => {
    this.setState(prevState => {
      if(prevState.usedNumbers.length === 9){
        return {doneStatus: 'Done. Nice!'};
      }
      if (this.state.redraws === 0 && !this.possibleSolutions(prevState)){
        return {doneStatus: 'Game Over!'};
      }
      if(this.state.secondsElapsed < 1000) {
        return {doneStatus: 'Game Over!'};
      }
    });
  };

  acceptAnswer = () => {
    this.setState(prevState => ({
      usedNumbers : prevState.usedNumbers.concat(prevState.selectedNumbers),
      selectedNumbers: [],
      answerIsCorrect: null,
      randomNumberOfStars: Game.randomNumber(),
    }), this.updateDoneStatus);
  };

  render(){
    return(
      <div className='container'> 
        <h3>Play Nine</h3>
        <hr/>
        <div className='row'>
          <h4>Remaining time: {this.state.secondsElapsed / 1000}</h4>
          <br/>
          <Stars numberOfStars={this.state.randomNumberOfStars} 
          />
          <Button selectedNumbers={this.state.selectedNumbers}
                  redraws={this.state.redraws}
                  checkAnswer={this.checkAnswer}
                  answerIsCorrect={this.state.answerIsCorrect}
                  acceptAnswer={this.acceptAnswer}
                  redraw={this.redraw}
          />
          <Answer selectedNumbers={this.state.selectedNumbers}
                  unselectNumber={this.unselectNumber} 
          />
        </div>
        <br/>
        {
          this.state.doneStatus ? <DoneFrame doneStatus={this.state.doneStatus} playAgain={this.playAgain}/> :
        
          <Numbers  selectedNumbers={this.state.selectedNumbers}
                    selectNumber={this.selectNumber}
                    usedNumbers={this.state.usedNumbers}
          />
        }
       
      </div> 
    );
  }
};

class App extends Component {
  render() {
    return (
      <div> 
        <Game />
      </div>
    );
  }
};

export default App;
