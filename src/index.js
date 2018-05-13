import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';

const breakpointValues = {
    xs: 0,
    sm: 200,
    md: 800,
    lg: 1150,
    xl: 1600,
};

const theme = createMuiTheme({
    palette: {
        primary: {
            main: '#e6598e',
        },
        type: 'dark',
    },
    breakpoints: { values: breakpointValues }
});

ReactDOM.render(<MuiThemeProvider theme={theme}><App /></MuiThemeProvider>, document.getElementById('root'));
registerServiceWorker();
