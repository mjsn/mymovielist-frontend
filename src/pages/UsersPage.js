import React from 'react';
import {TinyPagination as Pagination} from 'react-pagination-custom';
import Button from 'material-ui/Button';
import FavoriteIcon from '@material-ui/icons/Favorite';
import VisibilityIcon from '@material-ui/icons/Visibility';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
// eslint-disable-next-line no-unused-vars
import {Card, CardContent} from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import {withStyles} from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import {Link} from 'react-router-dom';
import HoverCard from '../components/HoverCard';
import SearchBar from 'material-ui-search-bar';
import { CircularProgress } from 'material-ui/Progress';

const styles = theme => ({
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        color: '#fff',
        marginTop: theme.spacing.unit * 3,
        textAlign: 'center'
    },
    usersLoading: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 100,
        paddingBottom: 100
    },
    search: {
        marginBottom: theme.spacing.unit * 3,
    },
    noResults: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 100,
        paddingBottom: 100
    },
    stat: {
        fontWeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    stats: {
        marginTop: theme.spacing.unit
    }
});

class UsersPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            users: [],
            searchResults: [],
            currentPage: 1,
            totalItems: 0,
            updated: false,
            usersLoading: true,
            search: ''
        };

        this.renderBtnNumber = this.renderBtnNumber.bind(this);
        this.getUserList = this.getUserList.bind(this);

    };

    componentDidMount() {
        this.setState({updated: false});
    };

    componentDidUpdate(prevProps) {
        if ((this.props.username !== '' && this.state.updated === false) || prevProps.match.params.status !== this.props.match.params.status || prevProps.match.params.username !== this.props.match.params.username) {
            this.setState({updated: true});
            this.getUserList();
            window.addEventListener('resize', this.props.setDrawerHeight);
        }
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.props.setDrawerHeight);
    };

    getUserList = () => {
        this.setState({usersLoading: true})
        const that = this;

        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/search/userStats`, {
                method: 'get',
                credentials: 'same-origin',
                headers: new Headers({
                    'X-Requested-With': 'XMLHttpRequest',
                    'Authorization': 'Basic',
                    'Content-Type': 'application/json',
                })
            }
        ).then(response => {
            if (response.status === 401) {
                that.setState({auth: false});
            } else {
                response.json().then(responseData => {
                    this.setState({
                        users: responseData._embedded.userStats,
                        searchResults: responseData._embedded.userStats,
                        totalItems: responseData._embedded.userStats.length,
                        usersLoading: false
                    });
                    that.props.setDrawerHeight();
                    window.scrollTo(0, 0);
                });
            }
        });
    };

    buttonPageClick = pageNumber => {
        switch(pageNumber) {
            case 'PRE':
                this.setState({currentPage: this.state.currentPage - 1});
                window.scrollTo(0, 0);
                break;
            case 'NEXT':
                this.setState({currentPage: this.state.currentPage + 1});
                window.scrollTo(0, 0);
                break;
            default:
                this.setState({currentPage: pageNumber});
                window.scrollTo(0, 0);
                break;
        }
    };

    renderBtnNumber = pageNumber => {
        return (
            <Button
                style={{
                    margin: 5,
                    minHeight: 0,
                    minWidth: 0,
                }}
                variant='raised'
                onClick={this.buttonPageClick.bind(this, pageNumber)}
                key={pageNumber}
                color={`${this.state.currentPage === pageNumber ? 'primary' : 'inherit'}`}
            >
                {pageNumber}
            </Button>
        );
    };

    changeSearch = searchQuery => {
        this.setState({
            searchResults: this.state.users.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase())),
            totalItems: this.state.users.filter(user => user.username.toLowerCase().includes(searchQuery.toLowerCase())).length,
        })

    };

    render() {
        const {classes} = this.props;
        const {
            currentPage,
            totalItems,
            usersLoading,
            search
        } = this.state;

        const unixTimeToDate = time => {
            const d = new Date( time * 1000 );
            const year  = d.getFullYear();
            const month = d.getMonth() + 1;
            const day  = d.getDate();
            return( year + '/' + month + '/' + day );
        };

        const userCards = this.state.searchResults.slice((currentPage - 1) * 40, currentPage * 40).map((user) =>
            <Grid key={user.username} item className={classes.grid}>
                <HoverCard>
                    <Link to={'/user/' + user.username}>
                        <div></div>
                        <CardContent>
                            <Typography variant='subheading'>
                                {user.username}
                            </Typography>
                            <Typography variant='caption'>
                                Member since {unixTimeToDate(user.signup_time)}
                            </Typography>

                            <Typography component='div' noWrap className={classes.stats}>
                                <Grid container className={this.props.classes.stats} spacing={8}>
                                    <Grid item xs={4} lg={4} md={4} sm={4}>
                                        <div className={this.props.classes.stat}>
                                            <VisibilityIcon style={{marginRight: 8}}/>
                                            {user.seen_total}
                                        </div>
                                    </Grid>
                                    <Grid item xs={4} lg={4} md={4} sm={4}>
                                        <div className={this.props.classes.stat}>
                                            <FavoriteIcon style={{marginRight: 8}}/>
                                            {user.favs_total}
                                        </div>
                                    </Grid>
                                    <Grid item xs={4} lg={4} md={4} sm={4}>
                                        <div className={this.props.classes.stat}>
                                            <WatchLaterIcon style={{marginRight: 8}}/>
                                            {user.later_total}
                                        </div>
                                    </Grid>
                                </Grid>
                            </Typography>
                        </CardContent>
                    </Link>
                </HoverCard>
            </Grid>
        );


        return (
            <div>
                <div className={classes.search}>
                    <SearchBar
                        onRequestSearch={(searchQuery) => this.changeSearch(searchQuery)}
                        style={{
                            margin: '0 auto',
                            maxWidth: 800
                        }}
                        value={search}
                    />

                </div>
                {usersLoading ? (
                    <div className={classes.usersLoading}>
                        <CircularProgress/>
                    </div>
                ) : (
                    <div>
                        <Grid container spacing={40} justify='center'>
                            {userCards}
                        </Grid>
                        {totalItems < 1 && (
                            <div className={classes.noResults}>
                                <Typography variant='display1' component='p' noWrap>
                                    No users.
                                </Typography>
                            </div>
                        )}

                        <div className={classes.pagination}>
                            <Pagination
                                total={totalItems}
                                selectedPageId={currentPage}
                                renderBtnNumber={this.renderBtnNumber}
                                maxBtnPerSide={2}
                                maxBtnNumbers={4}
                                counterStyle={{display: 'none'}}
                                itemPerPage={40}
                            />
                        </div>
                    </div>
                )
                }
            </div>
        );
    }
}

export default withStyles(styles, {withTheme: true})(UsersPage);