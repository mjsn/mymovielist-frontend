import React from 'react';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import Paper from 'material-ui/Paper';
import {withStyles} from 'material-ui/styles';
import AccountCircle from '@material-ui/icons/AccountCircle';
import VpnKey from '@material-ui/icons/VpnKey';
import Email from '@material-ui/icons/Email';
import Typography from 'material-ui/Typography';
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import { CircularProgress } from 'material-ui/Progress';
import Snackbar from 'material-ui/Snackbar';

const styles = theme => ({
    root: {
        overflow: 'hidden',
        padding: `0 ${theme.spacing.unit * 3}px`,
    },
    wrapper: {
        display: "flex",
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
    }
});

class RegisterPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            confirmPassword: "",
            email: "",
            register: false,
            registerError: "",
            loading: false
        };
    };

    componentWillMount() {
        ValidatorForm.addValidationRule('isPasswordMatch', (value) => {
            return value === this.state.password;
        });
    };

    register = event => {
        this.setState({loading: true})

        let that = this;
        event.preventDefault();

        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users`, {
            credentials: 'same-origin',
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "username": this.state.username,
                "password": this.state.password,
                "email": this.state.email
            })
        })
            .then(function (response) {
                if (response.status === 409) {
                    response.json().then(responseData => {
                        if (responseData.cause.cause.message.includes("Duplicate entry")) {
                            that.setState({
                                register: false,
                                username: "",
                                registerError: "Username already exists!",
                                loading: false
                            });
                        } else {
                            that.setState({
                                register: false,
                                registerError: "Error while registering, try again.",
                                loading: false
                            });
                        }
                    })
                } else {
                    that.setState({
                        register: true,
                        registerError: "Success! You can now sign in.",
                        loading: false
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
            confirmPassword,
            email,
            registerError,
            loading,
            register
        } = this.state;

        const {classes} = this.props;

        return (
            <div className={classes.root}>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={(registerError !== '' ? ( true ) : ( false ) )}
                    onClose={() => this.setState({registerError: ''})}
                    SnackbarContentProps={{
                        'aria-describedby': 'message-id',
                        style: {
                            color: 'firebrick',
                            backgroundColor: 'white'
                        }
                    }}
                    message={<span id="message-id">{registerError}</span>}
                    action={
                        <Button color="inherit" size="small" onClick={() => this.setState({registerError: ''})}>
                            Close
                        </Button>
                    }
                    autoHideDuration={10000}
                />
                <div className={classes.wrapper}>
                    <Paper className={classes.paper}>
                        <Typography variant="headline">Sign up</Typography>
                        <div>
                            <ValidatorForm
                                ref="form"
                                onSubmit={this.register}
                                onError={errors => console.log(errors)}
                            >
                                <Grid container spacing={8} alignItems="flex-end" justify="center"
                                      className={classes.grid}>
                                    <Grid item>
                                        <AccountCircle style={{color: 'white'}}/>
                                    </Grid>
                                    <Grid item>
                                        <TextValidator
                                            disabled={register}
                                            id="input-with-icon-grid"
                                            label="Username"
                                            value={username}
                                            onChange={this.inputChanged}
                                            name="username"
                                            validators={[
                                                'required',
                                                'minStringLength:4',
                                                'maxStringLength:20',
                                                'matchRegexp:^[A-Za-z0-9]+$'
                                            ]}
                                            errorMessages={[
                                                'This field is required',
                                                'Must be more than 4 characters',
                                                'Must be less than 20 characters',
                                                'Only letters (A-Z) and numbers (0-9)'
                                            ]}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={8} alignItems="flex-end" justify="center"
                                      className={classes.grid}>
                                    <Grid item>
                                        <VpnKey style={{color: 'white'}}/>
                                    </Grid>
                                    <Grid item>
                                        <TextValidator
                                            disabled={register}
                                            id="password-input"
                                            label="Password"
                                            type="password"
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={this.inputChanged}
                                            name="password"
                                            validators={['required']}
                                            errorMessages={['This field is required']}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={8} alignItems="flex-end" justify="center"
                                      className={classes.grid}>
                                    <Grid item>
                                        <VpnKey style={{color: 'white'}}/>
                                    </Grid>
                                    <Grid item>
                                        <TextValidator
                                            disabled={register}
                                            id="password-input"
                                            label="Confirm password"
                                            type="password"
                                            autoComplete="current-password"
                                            value={confirmPassword}
                                            onChange={this.inputChanged}
                                            name="confirmPassword"
                                            validators={['isPasswordMatch', 'required']}
                                            errorMessages={['Passwords do not match', 'This field is required']}
                                        />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={8} alignItems="flex-end" justify="center"
                                      className={classes.grid}>
                                    <Grid item>
                                        <Email style={{color: 'white'}}/>
                                    </Grid>
                                    <Grid item>
                                        <TextValidator
                                            disabled={register}
                                            id="input-with-icon-grid"
                                            label="E-mail address"
                                            value={email}
                                            onChange={this.inputChanged}
                                            name="email"
                                            validators={['required', 'isEmail']}
                                            errorMessages={['This field is required', 'Not a valid e-mail']}
                                        />
                                    </Grid>
                                </Grid>
                                <Button
                                    type="submit"
                                    variant="raised"
                                    color="primary"
                                    className={classes.button}
                                >
                                    {loading ? (
                                        <CircularProgress size={20} color="#fff"/>
                                    ) : (
                                        'Sign up'
                                    )}
                                </Button>
                            </ValidatorForm>
                        </div>
                    </Paper>
                </div>
            </div>
        );
    }
}

export default withStyles(styles)(RegisterPage);