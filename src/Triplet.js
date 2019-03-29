import React, { Component } from 'react';
import isAwesome from './Awesome.js'

class Triplet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            triplet: props.initialTriplet,
            tested: props.tested || false
        }
    }

    handleChange = (event, index) => {
        const number = event.target.value;
        this.setState(state => {
            state.triplet.splice(index, 1, number)
            return { triplet: state.triplet}
        })
    }

    testTriplet = () => {
        this.setState({ tested: true });
        this.props.onTested(this.state.triplet.map(Number));
    }

    isWellFormed = () => this.numericTriplet().every((n) => !isNaN(Number(n)))

    numericTriplet = () => this.state.triplet.map((n) => (n === '') ? NaN : Number(n))

    currentTripletIsAwesome = () =>  this.isWellFormed() && isAwesome(this.numericTriplet())

    render() { 
        return (<div className="triplet">
            <input name="t1" value={this.state.triplet[0]} onChange={e => this.handleChange(e, 0)}/>
            <input name="t2" value={this.state.triplet[1]} onChange={e => this.handleChange(e, 1)}/>
            <input name="t3" value={this.state.triplet[2]} onChange={e => this.handleChange(e, 2)}/>
            
            {this.state.tested 
            ? <span>{ this.currentTripletIsAwesome() ? "it's AWESOME!" : "it's not awesome" }</span> 
            : [
                <button onClick={this.testTriplet} disabled={!this.isWellFormed()}>Test</button>,
                <button onClick={this.props.onHavingEnough}>I've had enough</button>
            ]}
        </div>);
    }
}
 
export default Triplet;