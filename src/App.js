import React, { Component } from 'react';
import './index.css';
import TestTriplet from './TestTriplet';
import Triplet from './Triplet';

const defaultTriplet = [2, 4, 6]

class App extends Component {

  state = {
    started: false,
    decided: false,
    finished: false,
    knownTriplets: [],
    testResults: {}
  }

  startHypothesizing = () => {
    this.setState({started: true})
  }

  finishHypothesizing = () => {
    this.setState({ decided: true });
  }

  finishGame = () => {
    this.setState({ finished: true });
  }

  addKnownTriplet = (triplet) => {
    this.setState(state => ({ knownTriplets: [...state.knownTriplets, triplet] }));
  }

  nextDefaultTriplet = () => this.state.knownTriplets.length === 0 ? defaultTriplet : this.state.knownTriplets[this.state.knownTriplets.length - 1]

  handleTestChange = (triplet, correct) => {
    this.setState(state => ({ testResults: {...state.testResults, [triplet]: correct }}));
  }

  hasGuessedTheRule = () => {
    console.log(JSON.stringify(this.state.testResults));
    console.log(Object.values(this.state.testResults));
    return Object.values(this.state.testResults).reduce((a, b) => a && b, true)
  }

  render() {
    return (
      <div className="App">
        <h1>The 2-4-6 problem</h1>

        <p>Hi there! We're going to play a game based on a classic cognitive science experiment first performed by Peter Wason in 1960 (references at the end).</p>

        <p>Here's how it works. I'm thinking of a rule which separates sequences of three numbers into <emph>awesome</emph> triplets, and not-so-awesome triplets.
        I'll tell you for free that <code>{JSON.stringify(defaultTriplet)}</code> is an awesome triplet.</p>

        <p>What you need to do is to figure out which rule I'm thinking of. To help you do that, I'm going to let you experiment for a bit.
          Enter any three numbers, and I'll tell you whether they are awesome or not. You can do this as many times as you like, so please take your time.
          When you're sure you know what the rule is, just click on "I know the rule", and I'll test you to see if you've correctly worked out what the rule is.</p>
        
        {(this.state.started) 
          ? this.renderHypothesizingContent()
          : <button onClick={this.startHypothesizing}>Start the game</button>
        }
      </div>
    );
  }

  renderHypothesizingContent() {
    return [
      ...this.state.knownTriplets.map(
        (triplet, index) => <Triplet key={index} initialTriplet={triplet} tested={true}/>
      ), 
      this.state.decided
        ? this.renderTest()
        : <Triplet key={this.state.knownTriplets.length} 
                   initialTriplet={this.nextDefaultTriplet()} 
                   onTested={this.addKnownTriplet}
                   onHavingEnough={this.finishHypothesizing}/>
    ];
  }

  renderTest() {
    return <div>
      <p>So, you're pretty sure what the rule is now? Cool. I'm going to give you some sets of numbers, and you can tell me whether they seem awesome to you or not.</p>
      <TestTriplet triplet={[6, 4, 2]} showResult={this.state.finished} onChange={this.handleTestChange} />
      <TestTriplet triplet={[8, 10, 12]} showResult={this.state.finished} onChange={this.handleTestChange} />
      <TestTriplet triplet={[1, 17, 33]} showResult={this.state.finished} onChange={this.handleTestChange} />
      <TestTriplet triplet={[18, 9, 0]} showResult={this.state.finished} onChange={this.handleTestChange} />
      <TestTriplet triplet={[1, 7, 3]} showResult={this.state.finished} onChange={this.handleTestChange} />
      <TestTriplet triplet={[3, 5, 7]} showResult={this.state.finished} onChange={this.handleTestChange} />
      <TestTriplet triplet={[2, 9, 15]} showResult={this.state.finished} onChange={this.handleTestChange} />
      <TestTriplet triplet={[5, 10, 15]} showResult={this.state.finished} onChange={this.handleTestChange} />
      <TestTriplet triplet={[3, 1, 4]} showResult={this.state.finished} onChange={this.handleTestChange} />
      {this.state.finished ? this.renderFinalText() : <button onClick={this.finishGame} className="know-thy-truth">Know thy truth!</button>}
    </div>;
  }

  renderFinalText() {
    return <div>
      {this.hasGuessedTheRule() 
        ? <p>Congratulations! You have performed perfectly on this test, having devined the true rule: <b>awesome triplets are simply triplets in which each number is greater than the previous one</b>.</p>
        : [
          <p>Oops, you didn't expect this! <b>Awesome triplets are simply triplets in which each number is greater than the previous one</b>.</p>,
          <p>The rule for awesomeness was a fairly simple one, and most likely you invented a more complicated, more specific rule, which happened to fit the first triplet you saw. 
            In experimental tests, it has been found that 80% of subjects do just this, and then never test any of the pairs that <i>don't</i> fit their rule. 
            If they did, they would immediately see the more general rule that was applying. This is a case of what psychologists call <i>positive bias</i>. 
            It is one of the many biases, or fundamental errors, which beset the human mind.</p>
          ]
      }
      <p>It my surprise you to know this, but in tests carried out by Peter Wason, only 20% of subjects performed as well as you have.</p>
      <p>
        If you'd like to learn more about positive bias, you may enjoy the article <a href="http://www.overcomingbias.com/2007/08/positive-bias-l.html">Positive Bias: Look Into the Dark</a>.
        If you'd like to learn more about the experiment which inspired this test, look for a paper titled 'On the failure to eliminate hypotheses in a conceptual task'
        (Quarterly Journal of Experimental Psychology, 12: 129-140, 1960)
      </p>

      <hr/>

      <p>Based on MBlume C++ program found at <a href="https://wiki.lesswrong.com/wiki/Positive_bias">lesswrong</a>.</p>
    </div>;
  }
}

export default App;
