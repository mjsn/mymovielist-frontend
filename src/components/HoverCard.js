import React, {Component} from 'react';
import Card from 'material-ui/Card';

import {withStyles} from 'material-ui/styles';

const styles = ({
    card: {
        textAlign: 'center',
        width: 290,
        transition: ".15s",
        '&:hover': {
            backgroundColor: "#4b4b4b",
        },
        '& *:first-child > *:first-child': {
            transition: ".15s",
        },
        '&:hover > *:first-child > *:first-child': {
            opacity: .8,
        }
    },
});

class HoverCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            depth: 3,
        };

    };

    onMouseOver = () => this.setState({depth: 8});

    onMouseOut = () => this.setState({depth: 3});

    render() {
        const {classes} = this.props;

        return (
            <Card
                className={classes.card}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
                elevation={this.state.depth}
            >
                {this.props.children}
            </Card>
        );
    }
}

export default withStyles(styles, {withTheme: true})(HoverCard);