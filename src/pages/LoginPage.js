import React from 'react';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import {withStyles} from 'material-ui/styles';
import {Redirect, Switch} from 'react-router-dom'
import AccountCircle from '@material-ui/icons/AccountCircle';
import VpnKey from '@material-ui/icons/VpnKey';
import Typography from 'material-ui/Typography';
import { CircularProgress } from 'material-ui/Progress';
import Snackbar from 'material-ui/Snackbar';

const styles = theme => ({
    root: {
        overflow: 'hidden',
        padding: `0 ${theme.spacing.unit * 3}px`,
    },
    wrapper: {
        display: 'flex',
        textAlign: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        margin: theme.spacing.unit,
        padding: theme.spacing.unit * 8,
    },
    grid: {
        margin: theme.spacing.unit,
    },
    button: {
        margin: theme.spacing.unit,
    },
    loading: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 10,
    }
});

class LoginPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            login: false,
            loginError: '',
            loading: false
        };
    };

    signIn = event => {
        this.setState({loading: true})
        let that = this;
        event.preventDefault();

        fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
            credentials: 'same-origin',
            method: 'post',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': 'Basic ' + btoa(this.state.username + ':' + this.state.password),
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (response.status === 401) {
                    that.setState({
                        loading: false,
                        login: false,
                        loginError: 'Wrong username or password!'
                    });
                } else {
                    that.setState({
                        loading: false,
                        login: true,
                        loginError: ''
                    });
                }
            })
    };

    inputChanged = event => {
        this.setState({[event.target.name]: event.target.value});
    };

    render() {

        const {
            username,
            password,
            login,
            loginError,
            loading
        } = this.state;
        const {classes, auth} = this.props;

        if (login) {
            auth(username);

            return (
                <Switch>
                    <Redirect refresh='true' from='/login' to='/'/>
                </Switch>)
        }

        return (
            <div className={classes.root}>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={(loginError !== '' ? ( true ) : ( false ) )}
                    onClose={() => this.setState({loginError: ''})}
                    SnackbarContentProps={{
                        'aria-describedby': 'message-id',
                        style: {
                            color: 'firebrick',
                            backgroundColor: 'white'
                        }
                    }}
                    action={
                        <Button color="inherit" size="small" onClick={() => this.setState({loginError: ''})}>
                            Close
                        </Button>
                    }
                    message={<span id="message-id">{loginError}</span>}
                    autoHideDuration={10000}
                />
                <div className={classes.wrapper}>
                    <Paper className={classes.paper}>
                        <Typography variant='headline'>Sign in</Typography>
                        <div>
                            <form onSubmit={this.signIn}>
                                <Grid
                                    container
                                    spacing={8}
                                    alignItems='flex-end'
                                    justify='center'
                                    className={classes.grid}
                                >
                                    <Grid item>
                                        <AccountCircle style={{color: 'white'}}/>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                            id='input-with-icon-grid'
                                            label='Username'
                                            value={username}
                                            onChange={this.inputChanged}
                                            name='username'
                                        />
                                    </Grid>
                                </Grid>
                                <Grid
                                    container
                                    spacing={8}
                                    alignItems='flex-end'
                                    justify='center'
                                    className={classes.grid}
                                >
                                    <Grid item>
                                        <VpnKey style={{color: 'white'}}/>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                            id='password-input'
                                            label='Password'
                                            type='password'
                                            autoComplete='current-password'
                                            value={password}
                                            onChange={this.inputChanged}
                                            name='password'
                                        />
                                    </Grid>
                                </Grid>
                                <Button type='submit' variant='raised' color='primary' className={classes.button}>
                                    {loading ? (
                                        <CircularProgress size={20} color="#fff"/>
                                    ) : (
                                        'Sign in'
                                    )}
                                </Button>
                            </form>
                        </div>
                    </Paper>
                </div>
            </div>
        );
    }
}

export default withStyles(styles, {withTheme: true})(LoginPage);