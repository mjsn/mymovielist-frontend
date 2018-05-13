import React from 'react';
import {TinyPagination as Pagination} from 'react-pagination-custom';
import Button from 'material-ui/Button';
import AppBar from 'material-ui/AppBar';
import Tabs, { Tab } from 'material-ui/Tabs';
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
import Image from 'material-ui-image';
import {Rating} from 'material-ui-rating'
import Star from '@material-ui/icons/Star';
import orange from 'material-ui/colors/orange';
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
    media: {
        backgroundSize: '100%',
        height: 0,
        paddingTop: '148%',
    },
    overlay: {
        background: 'linear-gradient(rgba(255,255,255,.2), rgba(0,0,0,0))',
        marginBottom: '-150px',
        position: 'relative',
        zIndex: 100,
        opacity: .4,
        width: '100%',
        height: '150px',
    },
    moviesLoading: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 100,
        paddingBottom: 100
    },
    noResults: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 100,
        paddingBottom: 100
    },
    rating: {
        marginTop: -theme.spacing.unit * 5,
    },
    userInfo: {
        marginBottom: theme.spacing.unit * 4,
    },
    username: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: theme.spacing.unit * 2,
        color: "white"
    }
});

class MoviesPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            movies: [],
            tmdbMovies: [],
            tmdbIds: [],
            stats: [],
            currentPage: 1,
            totalItems: 0,
            itemsPerPage: 20,
            updated: false,
            moviesLoading: true,
            statsLoading: true,
            username: this.props.match.params.username,
            userNotFound: false,
        };

        this.getUserMovies = this.getUserMovies.bind(this);
        this.renderBtnNumber = this.renderBtnNumber.bind(this);
        this.getInfo = this.getInfo.bind(this);
        this.getStats = this.getStats.bind(this);

    };

    componentDidMount() {
        this.setState({updated: false});
    };

    componentDidUpdate(prevProps) {
        if ((this.props.username !== '' && this.state.updated === false) || prevProps.match.params.status !== this.props.match.params.status || prevProps.match.params.username !== this.props.match.params.username) {
            this.setState({updated: true});
            let status = this.props.match.params.status;
            let fav = "";

            if(status === "seen") {
                status = 2;
            } else if (status === "later") {
                status = 1;
            } else if (status === "favourites") {
                status = "";
                fav = 1;
            } else {
                status = 2;
            }

            this.getUserMovies(this.props.match.params.username, status, fav);
            this.getStats(this.props.match.params.username);

            window.addEventListener('resize', this.props.setDrawerHeight);
        }
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.props.setDrawerHeight);
    };

    getUserMovies = (username, status, fav = "") => {
        this.setState({moviesLoading: true})
        const that = this;

        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/movies?user.username=${username}&status=${status}&fav=${fav}&size=2000&sort=score,desc`, {
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
                let firstResponseData;
                let tmdbIds;
                response.json().then(responseData => {
                    firstResponseData = responseData;
                    tmdbIds = responseData._embedded.movies.map(value => value.tmdbId);
                    that.props.setDrawerHeight();
                    window.scrollTo(0, 0);

                    return fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tmdb/fetched`, {
                            method: 'post',
                            credentials: 'same-origin',
                            headers: new Headers({
                                'X-Requested-With': 'XMLHttpRequest',
                                'Authorization': 'Basic',
                                'Content-Type': 'application/json',
                            }),
                            body: JSON.stringify(tmdbIds)
                        }
                    );
                }).then(response => {
                    response.json().then(responseData => {
                        if(firstResponseData._embedded.movies.length > 0);
                        that.setState({
                            tmdbMovies: responseData,
                            moviesLoading: false,
                            movies: firstResponseData._embedded.movies,
                            currentPage: 1,
                            totalItems: firstResponseData.page.totalElements,
                            tmdbIds: tmdbIds,
                        });
                    })
                })
            }
        });
    };

    getStats = username => {
        const that = this;

        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/users/search/userStat?username=${username}`, {
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
            } else if (response.status >= 200 && response.status < 300) {
                response.json().then(responseData => {
                    that.setState({
                        username: responseData.username,
                        stats: responseData,
                        statsLoading: false
                    });
                });
            } else {
                that.setState({
                    userNotFound: true,
                    statsLoading: false
                });
            }
        });
    };

    getInfo = tmdbId => {
        const movieInfo = this.state.tmdbMovies.filter(entry => parseInt(entry.id, 10) === parseInt(tmdbId, 10))[0];
        const title = movieInfo.title;
        const poster_path = movieInfo.poster_path;
        let year;
        if(movieInfo.release_date) {
            year = movieInfo.release_date.split('-')[0];
        }

        return (
            <div>
                <Image
                    src={poster_path ? 'https://image.tmdb.org/t/p/w342' + poster_path : ' '}
                    title={title}
                    aspectRatio={500 / 750}
                    color='#777'
                />
                <CardContent className={this.props.classes.title}>
                    <Typography gutterBottom variant='headline' component='h2'>
                        {title} {year ? ( '(' + year + ')' ) : null}
                    </Typography>
                </CardContent>
            </div>
        );
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

    render() {
        const {classes} = this.props;
        const {
            currentPage,
            totalItems,
            moviesLoading,
            statsLoading,
            stats,
            username,
            userNotFound
        } = this.state;

        const movieCards = this.state.movies.slice((currentPage - 1) * 20, currentPage * 20).map((movie) =>
            <Grid key={movie.tmdbId} item className={classes.grid}>
                <HoverCard>
                    <Link to={'/movie/' + movie.tmdbId}>
                        <div className={classes.overlay}></div>
                        {this.getInfo(movie.tmdbId)}
                        <CardContent className={classes.rating}>
                            <Rating
                                iconHovered={(<Star style={{color: orange[500]}}/>)}
                                value={movie.score}
                                max={5}
                                readOnly
                            />
                        </CardContent>
                    </Link>
                </HoverCard>
            </Grid>
        );


        return (
            <div>
                <div className={classes.userInfo}>
                    <Typography variant="display1" className={classes.username}>{username}'s movie list</Typography>
                    <AppBar position="static" color="default">
                        <Tabs
                            onChange={(event, value) => this.props.history.push('/user/' + this.props.match.params.username + '/' + value)}
                            value={this.props.match.params.status}
                            indicatorColor="primary"
                            textColor="primary"
                            fullWidth
                            centered
                        >
                            <Tab value="seen" icon={<VisibilityIcon />} label={"Seen " + (stats.seen_total ? "(" + stats.seen_total + ")" : "")} />
                            <Tab value="favourites" icon={<FavoriteIcon />} label={"Favourites " + (stats.favs_total ? "(" + stats.favs_total + ")" : "")} />
                            <Tab value="later" icon={<WatchLaterIcon />} label={"See later " + (stats.later_total ? "(" + stats.later_total + ")" : "")} />
                        </Tabs>
                    </AppBar>
                </div>
                {moviesLoading || statsLoading ? (
                    <div className={classes.moviesLoading}>
                        <CircularProgress/>
                    </div>
                ) : userNotFound ? (
                    <div className={classes.moviesLoading}>
                        <Typography variant='display3' component='p' noWrap>
                            Not found.
                        </Typography>
                    </div>
                ) : (
                    <div>
                        <Grid container spacing={40} justify='center'>
                            {movieCards}
                        </Grid>
                        {totalItems < 1 && (
                            <div className={classes.noResults}>
                                <Typography variant='display1' component='p' noWrap>
                                    No results.
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
                                itemPerPage={20}
                            />
                        </div>
                    </div>
                )
                }
            </div>
        );
    }
}

export default withStyles(styles, {withTheme: true})(MoviesPage);