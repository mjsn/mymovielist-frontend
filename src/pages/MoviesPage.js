import React from 'react';
import {TinyPagination as Pagination} from 'react-pagination-custom';
import Button from 'material-ui/Button';
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
import FavoriteIcon from '@material-ui/icons/Favorite';
import VisibilityIcon from '@material-ui/icons/Visibility';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import SearchBar from 'material-ui-search-bar';
import { CircularProgress } from 'material-ui/Progress';

const styles = theme => ({
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        color: 'white',
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
    stats: {
        justifyContent: 'center'
    },
    stat: {
        fontWeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    search: {
        marginBottom: theme.spacing.unit * 3,
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
    genreGrid: {
        display: 'flex',
        justifyContent: 'center',
        maxWidth: 800,
        margin: '0 auto',
        marginTop: theme.spacing.unit * 2,
    },
    genreGridItem: {
        display: 'flex',
        justifyContent: 'center'
    }
});

class MoviesPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            search: '',
            tmdbMovies: [],
            movieStats: [],
            genres: [],
            currentPage: 1,
            totalItems: 0,
            itemsPerPage: 20,
            updated: false,
            moviesLoading: true,
            selectedGenres: []
        };

        this.getMoviesFromTmdb = this.getMoviesFromTmdb.bind(this);
        this.renderBtnNumber = this.renderBtnNumber.bind(this);
        this.getStats = this.getStats.bind(this);

    };

    componentDidMount() {
        this.setState({updated: false});
    };

    componentDidUpdate() {
        if (this.props.username !== '' && this.state.updated === false) {
            this.setState({updated: true});
            this.getMoviesFromTmdb(1, this.state.search, this.state.selectedGenres.join(","));
            window.addEventListener('resize', this.props.setDrawerHeight);
        }
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.props.setDrawerHeight);
    };

    changeSearch = searchQuery => {
        this.setState({search: searchQuery, selectedGenres: []});
        this.getMoviesFromTmdb(1, searchQuery);
    };

    changeGenres = genres => {
        this.setState({search: ''});
        this.getMoviesFromTmdb(1, '', genres);
    };

    toggleGenre = id => {
        let genres;
        let currentGenres = this.state.selectedGenres;

        if(this.state.selectedGenres.includes(id)) {
            genres = currentGenres.filter(i => i !== id);
        } else {
            genres = currentGenres.concat(id);
        }

        this.setState({selectedGenres: genres, search: ''});

        this.changeGenres(genres.join(","));
    };

    getMoviesFromTmdb = (pageNumber, searchQuery = '', genres = '') => {
        this.setState({moviesLoading: true})
        const that = this;
        let tmdbApi;

        if (searchQuery !== '') {
            tmdbApi = 'search?page=' + pageNumber + '&query=' + searchQuery;
        } else {
            tmdbApi = 'movies?page=' + pageNumber + '&genres=' + genres;
        }

        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tmdb/${tmdbApi}`, {
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
                    let totalItems = responseData.total_results;
                    if (totalItems > 20000) {
                        totalItems = 20000;
                    }
                    that.setState({
                        tmdbMovies: responseData.results,
                        currentPage: responseData.page,
                        totalItems: totalItems,
                    });

                    let statsUrl = `${process.env.REACT_APP_API_BASE_URL}/api/movies/?size=2000`;

                    for (let key in responseData.results) {
                        statsUrl += '&tmdbId=' + responseData.results[key].id;
                    }
                    that.props.setDrawerHeight();
                    window.scrollTo(0, 0);

                    return fetch(statsUrl, {
                            method: 'get',
                            credentials: 'same-origin',
                            headers: new Headers({
                                'X-Requested-With': 'XMLHttpRequest',
                                'Authorization': 'Basic',
                                'Content-Type': 'application/json',
                            })
                        }
                    );
                }).then(response => {
                    response.json().then(responseData => {
                        that.setState({
                            movieStats: responseData._embedded.movies,
                            moviesLoading: false,
                        });
                    })
                })
            }
        });
    };

    getStats = tmdbId => {
        const movieStats = this.state.movieStats.filter(entry => parseInt(entry.tmdbId, 10) === parseInt(tmdbId, 10));
        let total = 0, length = 0, score = 0;
        for (let i = 0; i < movieStats.length; i++) {
            score = movieStats[i].score;
            total += score;
            if (score !== 0) {
                length++;
            }
        }
        let averageRating = ~~(total / length);
        if (isNaN(averageRating)) {
            averageRating = 0;
        }

        const numberSeen = movieStats.filter(value => value.status === 2).length;
        const numberWantToSee = movieStats.filter(value => value.status === 1).length;
        const numberFavourite = movieStats.filter(value => value.fav === 1).length;

        return (
            <div>
                <Rating
                    iconHovered={(<Star style={{color: orange[500]}}/>)}
                    value={averageRating}
                    max={5}
                    readOnly
                />

                <Grid container className={this.props.classes.stats} spacing={8}>
                    <Grid item xs={4} lg={4} md={4} sm={4}>
                        <div className={this.props.classes.stat}>
                            <VisibilityIcon style={{marginRight: 8}}/>
                            {numberSeen}
                        </div>
                    </Grid>
                    <Grid item xs={4} lg={4} md={4} sm={4}>
                        <div className={this.props.classes.stat}>
                            <FavoriteIcon style={{marginRight: 8}}/>
                            {numberFavourite}
                        </div>
                    </Grid>
                    <Grid item xs={4} lg={4} md={4} sm={4}>
                        <div className={this.props.classes.stat}>
                            <WatchLaterIcon style={{marginRight: 8}}/>
                            {numberWantToSee}
                        </div>
                    </Grid>
                </Grid>
            </div>
        );
    };

    buttonPageClick = pageNumber => {
        switch(pageNumber) {
            case 'PRE':
                this.getMoviesFromTmdb(this.state.currentPage - 1, this.state.search, this.state.selectedGenres.join(","));
                break;
            case 'NEXT':
                this.getMoviesFromTmdb(this.state.currentPage + 1, this.state.search, this.state.selectedGenres.join(","));
                break;
            default:
                this.getMoviesFromTmdb(pageNumber, this.state.search, this.state.selectedGenres.join(","));
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
            selectedGenres,
            search
        } = this.state;
        const movieCards = this.state.tmdbMovies.map((movie) =>
            <Grid key={movie.id} item className={classes.grid}>
                <HoverCard>
                    <Link to={'/movie/' + movie.id}>
                        <div className={classes.overlay}></div>
                        <Image
                            src={movie.poster_path ? 'https://image.tmdb.org/t/p/w342' + movie.poster_path : ' '}
                            title={movie.title}
                            aspectRatio={500 / 750}
                            color='#777'
                        />
                        <CardContent>
                            <Typography gutterBottom variant='headline' component='h2'>
                                {movie.title} {movie.release_date ? ( '(' + movie.release_date.split('-')[0] + ')' ) : null}
                            </Typography>
                            <Typography component='div' noWrap>
                                {this.getStats(movie.id)}
                            </Typography>
                        </CardContent>
                    </Link>
                </HoverCard>

            </Grid>
        );

        const genres = [
            {
                id: 28,
                name: 'Action'
            },
            {
                id: 12,
                name: 'Adventure'
            },
            {
                id: 16,
                name: 'Animation'
            },
            {
                id: 35,
                name: 'Comedy'
            },
            {
                id: 80,
                name: 'Crime'
            },
            {
                id: 99,
                name: 'Documentary'
            },
            {
                id: 18,
                name: 'Drama'
            },
            {
                id: 10751,
                name: 'Family'
            },
            {
                id: 14,
                name: 'Fantasy'
            },
            {
                id: 36,
                name: 'History'
            },
            {
                id: 27,
                name: 'Horror'
            },
            {
                id: 10402,
                name: 'Music'
            },
            {
                id: 9648,
                name: 'Mystery'
            },
            {
                id: 10749,
                name: 'Romance'
            },
            {
                id: 878,
                name: 'Science Fiction'
            },
            {
                id: 53,
                name: 'Thriller'
            },
            {
                id: 10752,
                name: 'War'
            },
            {
                id: 37,
                name: 'Western'
            }
        ];

        const genreButtons = genres.map((genre) =>
            <Grid key={genre.id} item xs={2} className={classes.genreGridItem}>
                <Button size='small' id={genre.id} onClick={() => {this.toggleGenre(genre.id)}} color={selectedGenres.includes(genre.id) ? 'primary' : 'default'}>
                    {genre.name}
                </Button>
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
                    <Grid container spacing={0} justify='center' className={classes.genreGrid}>
                        {genreButtons}
                    </Grid>
                </div>
                {moviesLoading ? (
                    <div className={classes.moviesLoading}>
                        <CircularProgress/>
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