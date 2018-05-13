import React from 'react';
import {withStyles} from 'material-ui/styles';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import Button from 'material-ui/Button';
import Hidden from 'material-ui/Hidden';
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';
import AccountCircle from '@material-ui/icons/AccountCircle';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import ListIcon from '@material-ui/icons/List';
import {BrowserRouter, Route, Link, Redirect, Switch} from 'react-router-dom'
import Menu, {MenuItem, MenuList} from 'material-ui/Menu';
import {ListItemIcon, ListItemText} from 'material-ui/List';
import InputIcon from '@material-ui/icons/Input';
import FavoriteIcon from '@material-ui/icons/Favorite';
import VisibilityIcon from '@material-ui/icons/Visibility';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import MoviesPage from './pages/MoviesPage';
import MoviePage from './pages/MoviePage';
import UserPage from './pages/UserPage';
import UsersPage from './pages/UsersPage';

const drawerWidth = 240;
const title = 'MyMovieList';

const styles = theme => ({
    root: {
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        width: '100vw',
        minHeight: '100vh',
    },
    flex: {
        flex: 1,
    },
    appBar: {
        position: 'fixed',
        marginLeft: drawerWidth,
        zIndex: theme.zIndex.drawer + 1,
    },
    appBar2: {
        position: 'absolute',
        marginLeft: drawerWidth,
        zIndex: theme.zIndex.drawer + 1,
    },
    navIconHide: {
        [theme.breakpoints.up('lg')]: {
            display: 'none',
        },
        marginLeft: -12,
        marginRight: 12,
    },
    drawerPaper: {
        minHeight: '100vh',
        width: drawerWidth,
        [theme.breakpoints.up('lg')]: {
            position: 'fixed',
        },
    },
    content: {
        [theme.breakpoints.up('lg')]: {
            marginLeft: drawerWidth,
        },
        flexGrow: 1,
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing.unit * 3,
        paddingRight: theme.spacing.unit * 5,
        minWidth: 100,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
    menuItem: {
        '&:focus': {
            backgroundColor: theme.palette.primary.main,
            '& $primary, & $icon': {
                color: theme.palette.common.white,
            },
        },
    },
    icon: {
        color: theme.palette.common.white,
    },
    buttonIcon: {
        marginLeft: theme.spacing.unit
    },
    notFound: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 100,
        paddingBottom: 100
    },
    toolbar: theme.mixins.toolbar,
});

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            auth: true,
            mobileOpen: false,
            anchorEl: null,
            username: '',
            userDetails: [],
            movieList: [],
            drawerHeight: 0
        };

        this.calcHeight = this.calcHeight.bind(this);
        this.setDrawerHeight = this.setDrawerHeight.bind(this);
        this.auth = this.auth.bind(this);
        this.getUserDetails = this.getUserDetails.bind(this);
        this.getUserMovieList = this.getUserMovieList.bind(this);
    };

    componentWillMount() {
        this.checkAuthentication();
    };

    componentDidMount() {
        this.setDrawerHeight();
    };

    checkAuthentication = () => {
        const that = this;
        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user`, {
            credentials: 'include',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': 'Basic'
            }
        })
            .then(function (response) {
                response.json().then(function (responseData) {
                    if (responseData === null) {
                        that.setState({
                            auth: false,
                            username: ''
                        });
                    } else {
                        const username = responseData.principal.username;
                        that.getUserDetails(username).then(userDetails => {
                            that.setState({userDetails: userDetails});
                        });
                        that.setState({
                            auth: true,
                            username: username
                        });
                    }
                })
            })
    };

    getUserDetails = username => {
        return fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users?username=` + username, {
            credentials: 'include',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': 'Basic'
            }
        })
            .then((response) => response.json())
            .then((responseData) => {
                return responseData._embedded.users[0];
            })
    };

    getUserMovieList = username => {
        return this.getUserDetails(username).then(userDetails => {
            return fetch(userDetails._links.movieList.href, {
                credentials: 'include',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': 'Basic'
                }
            })
                .then((response) => response.json())
                .then((responseData) => {
                    return responseData._embedded.movies;
                })
        });
    };

    signOut = () => {
        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/logout` , {
            credentials: 'include',
            redirect: 'manual',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Authorization': 'Basic'
            }
        })
            .then(function () {
                window.location.reload();
            })
    };

    auth = username => {
        this.setState({
            auth: true,
            username: username
        });
        this.checkAuthentication();
    };

    calcHeight = () => {
        const element = document.getElementsByTagName('main')[0].children[1];
        if (element) return element.scrollHeight + 100;
    };

    setDrawerHeight = () => {
        this.setState({drawerHeight: this.calcHeight()});
    };

    handleDrawerToggle = () => {
        this.setState({mobileOpen: !this.state.mobileOpen});
    };

    handleDrawerClose = () => {
        this.setState({mobileOpen: false});
    };

    handleMenu = event => {
        this.setState({anchorEl: event.currentTarget});
    };

    handleClose = () => {
        this.setState({anchorEl: null});
    };

    render() {
        const {auth, anchorEl, drawerHeight, username} = this.state;
        const open = Boolean(anchorEl);
        const {classes} = this.props;

        const drawer = (
            <div>
                <AppBar
                    style={{boxShadow: 'none'}}
                    position='absolute'
                    className={classes.appBar2}
                >
                    <Toolbar>
                        <IconButton
                            color='inherit'
                            aria-label='open drawer'
                            onClick={this.handleDrawerToggle}
                            className={classes.navIconHide}
                        >
                            <CloseIcon/>
                        </IconButton>
                        <Typography
                            variant='title'
                            color='inherit'
                            className={classes.flex}
                            noWrap>
                            <Link to='/'>{title}</Link>
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div className={classes.toolbar}/>

                {auth && (

                    <MenuList>
                        <Link onClick={this.handleDrawerClose} to='/'>
                            <MenuItem className={classes.menuItem}>
                                <ListItemIcon className={classes.icon}>
                                    <ListIcon/>
                                </ListItemIcon>
                                <ListItemText
                                    classes={{primary: classes.primary}}
                                    inset
                                    primary='All movies'
                                />
                            </MenuItem>
                        </Link>
                        <Link onClick={this.handleDrawerClose}  to={'/user/' + username + '/seen'}>
                            <MenuItem className={classes.menuItem}>
                                <ListItemIcon className={classes.icon}>
                                    <VisibilityIcon/>
                                </ListItemIcon>
                                <ListItemText
                                    classes={{primary: classes.primary}}
                                    inset
                                    primary='Seen'
                                />
                            </MenuItem>
                        </Link>
                        <Link onClick={this.handleDrawerClose}  to={'/user/' + username + '/favourites'}>
                            <MenuItem className={classes.menuItem}>
                                <ListItemIcon className={classes.icon}>
                                    <FavoriteIcon/>
                                </ListItemIcon>
                                <ListItemText
                                    classes={{primary: classes.primary}}
                                    inset
                                    primary='Favourites'
                                />
                            </MenuItem>
                        </Link>
                        <Link onClick={this.handleDrawerClose}  to={'/user/' + username + '/later'}>
                            <MenuItem className={classes.menuItem}>
                                <ListItemIcon className={classes.icon}>
                                    <WatchLaterIcon/>
                                </ListItemIcon>
                                <ListItemText
                                    classes={{primary: classes.primary}}
                                    inset
                                    primary='See later'
                                />
                            </MenuItem>
                        </Link>
                        <Link onClick={this.handleDrawerClose}  to='/users'>
                            <MenuItem className={classes.menuItem}>
                                <ListItemIcon className={classes.icon}>
                                    <AccountBoxIcon/>
                                </ListItemIcon>
                                <ListItemText
                                    classes={{primary: classes.primary}}
                                    inset
                                    primary='Users'
                                />
                            </MenuItem>
                        </Link>

                    </MenuList>
                )}


                {!auth && (

                    <MenuList>
                        <Link to='/login'>
                            <MenuItem className={classes.menuItem}>
                                <ListItemIcon className={classes.icon}>
                                    <InputIcon/>
                                </ListItemIcon>
                                <ListItemText
                                    classes={{primary: classes.primary}}
                                    inset
                                    primary='Sign in'
                                />
                            </MenuItem>
                        </Link>
                        <Link to='/register'>
                            <MenuItem className={classes.menuItem}>
                                <ListItemIcon className={classes.icon}>
                                    <PersonAddIcon/>
                                </ListItemIcon>
                                <ListItemText
                                    classes={{primary: classes.primary}}
                                    inset
                                    primary='Sign up'
                                />
                            </MenuItem>
                        </Link>
                    </MenuList>
                )}
            </div>
        );


        return (
            <BrowserRouter>
                <div className={classes.root}>
                    <AppBar position='absolute' className={classes.appBar}>
                        <Toolbar>
                            <IconButton
                                color='inherit'
                                aria-label='open drawer'
                                onClick={this.handleDrawerToggle}
                                className={classes.navIconHide}
                            >
                                <MenuIcon/>
                            </IconButton>
                            <Typography
                                variant='title'
                                color='inherit'
                                className={classes.flex}
                                noWrap
                            >
                                <Link to='/'>{title}</Link>
                            </Typography>
                            {auth && (
                                <div>
                                    <Button
                                        aria-owns={open ? 'menu-appbar' : null}
                                        aria-haspopup='true'
                                        onClick={this.handleMenu}
                                        color='inherit'
                                    >
                                        {username}
                                        <AccountCircle className={classes.buttonIcon}/>
                                    </Button>
                                    <Menu
                                        id='menu-appbar'
                                        anchorEl={anchorEl}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        transformOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        open={open}
                                        onClose={this.handleClose}
                                    >
                                        <Link to={'/user/' + username}>
                                            <MenuItem onClick={this.handleClose}>My Profile</MenuItem>
                                        </Link>
                                        <MenuItem onClick={this.signOut}>Sign Out</MenuItem>
                                    </Menu>
                                </div>
                            )}
                        </Toolbar>
                    </AppBar>
                    <Hidden lgUp>
                        <Drawer
                            PaperProps={{style: {height: drawerHeight}}}
                            variant='temporary'
                            anchor='left'
                            open={this.state.mobileOpen}
                            onClose={this.handleDrawerToggle}
                            classes={{paper: classes.drawerPaper}}
                            ModalProps={{keepMounted: true}}
                        >
                            {drawer}
                        </Drawer>
                    </Hidden>
                    <Hidden mdDown implementation='css'>
                        <Drawer
                            PaperProps={{style: {height: drawerHeight}}}
                            variant='permanent'
                            open
                            classes={{paper: classes.drawerPaper}}
                        >
                            {drawer}
                        </Drawer>

                    </Hidden>
                    <main className={classes.content} ref='main'>
                        <div className={classes.toolbar}/>
                        <Switch>
                            <Route
                                exact
                                path='/'
                                render=
                                    {() => (
                                        !auth ? (
                                            <Redirect to='/login'/>
                                        ) : (
                                            <Redirect to='/movies'/>
                                        )
                                    )}
                            />

                            <Route
                                exact
                                path='/movies'
                                render=
                                    {(props) => (
                                        auth ? (
                                            <MoviesPage
                                                {...props}
                                                {...this.state}
                                                setDrawerHeight={this.setDrawerHeight}
                                                calcHeight={this.calcHeight}
                                            />
                                        ) : (
                                            <Redirect to='/login'/>
                                        )
                                    )}
                            />

                            <Route
                                exact
                                path='/movie/:id'
                                render=
                                    {(props) => (
                                        auth ? (
                                            <MoviePage
                                                {...props}
                                                {...this.state}
                                                setDrawerHeight={this.setDrawerHeight}
                                                calcHeight={this.calcHeight}
                                                getUserMovieList={this.getUserMovieList}
                                            />
                                        ) : (
                                            <Redirect to='/login'/>
                                        )
                                    )}
                            />

                            <Route
                                exact
                                path='/user/:username'
                                render=
                                    {(props) => (
                                        !auth ? (
                                            <Redirect to='/login'/>
                                        ) : (
                                            <Redirect to={'/user/' + props.match.params.username + '/seen'}/>
                                        )
                                    )}
                            />

                            <Route
                                exact
                                path='/user/:username/:status'
                                render=
                                    {(props) => (
                                        auth ? (
                                            <UserPage
                                                {...props}
                                                {...this.state}
                                                setDrawerHeight={this.setDrawerHeight}
                                                calcHeight={this.calcHeight}
                                            />
                                        ) : (
                                            <Redirect to='/login'/>
                                        )
                                    )}
                            />

                            <Route
                                exact
                                path='/users'
                                render=
                                    {(props) => (
                                        auth ? (
                                            <UsersPage
                                                {...props}
                                                {...this.state}
                                                setDrawerHeight={this.setDrawerHeight}
                                                calcHeight={this.calcHeight}
                                            />
                                        ) : (
                                            <Redirect to='/login'/>
                                        )
                                    )}
                            />

                            <Route
                                exact
                                path='/register'
                                render=
                                    {() => (
                                        auth ? (
                                            <Redirect to='/'/>
                                        ) : (
                                            <RegisterPage/>
                                        )
                                    )}
                            />


                            <Route
                                exact
                                path='/login'
                                render=
                                    {
                                        (props) => (
                                            auth ? (
                                                <Redirect to='/'/>
                                            ) : (
                                                <LoginPage {...props} auth={this.auth}/>
                                            )
                                        )}
                            />

                            <Route render=
                                       {
                                           () =>
                                               <div className={classes.notFound}>
                                                   <Typography variant='display3' component='p' noWrap>
                                                       Not found.
                                                   </Typography>
                                               </div>
                                       }
                            />
                        </Switch>

                    </main>
                </div>
            </BrowserRouter>
        );
    }
}

export default withStyles(styles, {withTheme: true})(App);