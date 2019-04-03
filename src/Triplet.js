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
            {this.state.tested 
            ? <span><code>{JSON.stringify(this.numericTriplet())}</code> { this.currentTripletIsAwesome() ? "is AWESOME!" : "is not awesome" }</span> 
            : [
                this.state.triplet.map((value, index) => 
                    <input name={`t${index}`} 
                    value={value} 
                    onChange={e => this.handleChange(e, index)}
                    />
                ),
                <button onClick={this.testTriplet} disabled={!this.isWellFormed()}>Test</button>,
                <button onClick={this.props.onHavingEnough}>I've had enough</button>
            ]}
        </div>);
    }
}
 
export default Triplet;