import React, { Component } from 'react';
import isAwesome from './Awesome.js'

class TestTriplet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            markedAwesome: false,
            correct: !isAwesome(this.props.triplet)
        };
        props.onChange(props.triplet, this.state.correct);
    }

    handleChange = (event) => {
        const markedAwesome = event.target.checked;
        const correct = isAwesome(this.props.triplet) === event.target.checked;
        this.setState({ markedAwesome, correct });
        this.props.onChange(this.props.triplet, correct);
    };

    render() {
        return <div className={(this.props.showResult && !this.state.correct) ? "wrong-result" : ""}>
            Is <code>{JSON.stringify(this.props.triplet)}</code> awesome?
            <input type="checkbox" 
                checked={this.state.markedAwesome}
                onChange={e => this.handleChange(e)}
                disabled={this.props.showResult}/>
        </div>;
    }
}
 
export default TestTriplet;