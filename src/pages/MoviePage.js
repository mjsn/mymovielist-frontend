import React from 'react';
import langs from 'langs';
import {TinyPagination as Pagination} from 'react-pagination-custom';
import Avatar from 'material-ui/Avatar';
import Button from 'material-ui/Button';
import Card, {CardContent, CardHeader} from 'material-ui/Card';
import Typography from 'material-ui/Typography';
import {withStyles} from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import {Link} from 'react-router-dom';
import Image from 'material-ui-image';
import FavoriteIcon from '@material-ui/icons/Favorite';
import VisibilityIcon from '@material-ui/icons/Visibility';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import {Rating} from 'material-ui-rating'
import orange from 'material-ui/colors/orange';
import Star from '@material-ui/icons/Star';
import {TextValidator, ValidatorForm} from 'react-material-ui-form-validator';
import nl2br from 'react-nl2br';
import { CircularProgress, LinearProgress } from 'material-ui/Progress';
import Dialog, {
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';
import {
    ListItem,
    ListItemAvatar,
    ListItemText,
} from 'material-ui/List';
import Tooltip from 'material-ui/Tooltip';
import Snackbar from 'material-ui/Snackbar';


const styles = theme => ({
    movieCard: {
        textAlign: 'center',
        maxWidth: 600,
    },
    detailsCard: {
        [theme.breakpoints.down('md')]: {
            maxWidth: 600,
        },
    },
    media: {
        height: 0,
        paddingTop: '150%',
    },
    actions: {
        marginLeft: -10,
        marginTop: 5,
        justify: 'center'
    },
    favourite: {
        marginTop: theme.spacing.unit * 1,
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    writeReview: {
        width: '100%',
        float: 'left'
    },
    reviewField: {
        float: 'right',
        width: '100%'
    },
    buttonRight: {
        marginLeft: theme.spacing.unit,
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
        float: 'right'
    },
    buttonLeft: {
        marginRight: theme.spacing.unit,
        marginTop: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
    },
    reviewGrid: {
        flexGrow: 1,
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        color: '#fff',
        marginTop: theme.spacing.unit * 3,
        textAlign: 'center'
    },
    actionsLoading: {
        marginLeft: 6,
        marginTop: 22,
        marginBottom: 22
    },
    detailsLoading: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 200,
        paddingBottom: 200
    }
});

class MoviePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tmdbMovie: [],
            cast: [],
            staff: [],
            countries: [],
            releaseDate: '0000/00/00',
            releaseYear: '0000',
            language: '',
            productionCompanies: [],
            genres: [],
            numberSeen: 0,
            numberWantToSee: 0,
            numberFavourite: 0,
            averageRating: 0,
            reviews: [],
            status: 0,
            favourite: 0,
            rating: 0,
            review: '',
            newReview: '',
            writeReview: false,
            updated: false,
            movie: '',
            movies: [],
            seenColor: 'inherit',
            wantToSeeColor: 'inherit',
            favouriteColor: 'inherit',
            alertOpen: false,
            numberOfRatings: 0,
            reviewPage: 1,
            numberOfReviews: 0,
            detailsLoading: true,
            actionsLoading: true,
            remove: true,
            snackBar: '',
            removeAlertOpen: false
        };
        this.getMovieFromTmdb = this.getMovieFromTmdb.bind(this);
        this.addToSeen = this.addToSeen.bind(this);
        this.addToFavourites = this.addToFavourites.bind(this);
        this.addToWanted = this.addToWanted.bind(this);
        this.saveReview = this.saveReview.bind(this);
        this.removeFromFavourites = this.removeFromFavourites.bind(this);
        this.removeFromSeen = this.removeFromSeen.bind(this);
        this.renderBtnNumber = this.renderBtnNumber.bind(this);
    };

    componentDidMount() {
        this.setState({updated: false});
    }

    componentDidUpdate() {
        let originalStatus = "";
        if (this.props.username !== '' && this.state.updated === false) {
            this.setState({updated: true});
            this.getMovieFromTmdb(this.props.match.params.id);
            this.getMovieStats(this.props.match.params.id);
            window.addEventListener('resize', this.props.setDrawerHeight);
            this.props.getUserMovieList(this.props.username).then(movieList => {
                originalStatus = movieList.find(movie => parseInt(movie.tmdbId, 10) === parseInt(this.props.match.params.id, 10));
                if (originalStatus !== undefined) {
                    if (originalStatus.notes === null) {
                        originalStatus.notes = '';
                    }
                    this.setState({
                        status: originalStatus.status,
                        favourite: originalStatus.fav,
                        review: originalStatus.notes,
                        rating: originalStatus.score,
                        movie: originalStatus._links.movie.href,
                        actionsLoading: false,
                        detailsLoading: false
                    });
                    if (originalStatus.fav === 1) {
                        this.setState({favouriteColor: 'primary'});
                    }
                    if (originalStatus.status === 1) {
                        this.setState({wantToSeeColor: 'primary'});
                    } else if (originalStatus.status === 2) {
                        this.setState({seenColor: 'primary'});
                    }
                } else {
                    this.setState({
                        actionsLoading: false,
                        detailsLoading: false,
                    });
                }
            });
        }
    };

    componentWillUnmount() {
        window.removeEventListener('resize', this.props.setDrawerHeight);
    };

    patch = () => {
        return this.state.movie !== '';
    };

    addToSeen = () => {
        let apiUrl, method;
        if (this.patch()) {
            apiUrl = this.state.movie;
            method = 'PATCH';
        } else {
            apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/movies`;
            method = 'POST';
        }

        const that = this;
        fetch(apiUrl, {
                method: method,
                credentials: 'same-origin',
                body: JSON.stringify({
                    tmdbId: parseInt(that.state.tmdbMovie.id, 10),
                    status: 2,
                    user: that.props.userDetails._links.user.href,
                    notes: '',
                }),
                headers: new Headers({
                    'Authorization': 'Basic',
                    'Content-Type': 'application/json',
                })
            }
        ).then(function (response) {
            if (response.status === 401) {
                that.setState({auth: false});
            } else {
                response.json().then(function (responseData) {
                    if (that.state.status === 1) {
                        that.setState({
                            numberWantToSee: that.state.numberWantToSee - 1,
                            wantToSeeColor: 'inherit',
                            review: '',
                        })
                    }
                    that.setState({
                        status: 2,
                        numberSeen: that.state.numberSeen + 1,
                        seenColor: 'primary',
                        movie: responseData._links.movie.href,
                        snackBar: 'Added to list of seen movies'
                    });
                })
            }
        });
    };

    addToWanted = () => {
        let apiUrl, method;

        if (this.patch()) {
            apiUrl = this.state.movie;
            method = 'PATCH';
        } else {
            apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/movies`;
            method = 'POST';
        }

        const that = this;
        fetch(apiUrl, {
                method: method,
                credentials: 'same-origin',
                body: JSON.stringify({
                    tmdbId: that.state.tmdbMovie.id,
                    status: 1,
                    fav: 0,
                    score: 0,
                    user: that.props.userDetails._links.user.href,
                    notes: '',
                }),
                headers: new Headers({
                    'Authorization': 'Basic',
                    'Content-Type': 'application/json',
                })
            }
        ).then(function (response) {
            if (response.status === 401) {
                that.setState({auth: false});
            } else {
                response.json().then(function (responseData) {
                    if (that.state.status === 2) {
                        that.setState({
                            numberSeen: that.state.numberSeen - 1,
                            seenColor: 'inherit',
                        })
                    }
                    if (that.state.favourite === 1) {
                        that.setState({
                            favourite: 0,
                            numberFavourite: that.state.numberFavourite - 1,
                            favouriteColor: 'inherit',
                        })
                    }
                    if (that.state.rating !== 0) {
                        that.setState({
                            averageRating: (that.state.averageRating * that.state.numberOfRatings - that.state.rating) / (that.state.numberOfRatings - 1),
                            numberOfRatings: that.state.numberOfRatings - 1
                        })
                    }
                    that.setState({
                        review: '',
                        rating: 0,
                        status: 1,
                        numberWantToSee: that.state.numberWantToSee + 1,
                        wantToSeeColor: 'primary',
                        movie: responseData._links.movie.href,
                        alertOpen: false,
                        snackBar: 'Added to list of movies you want to see later'
                    });
                })
            }
        });
    };

    removeFromSeen = () => {
        const that = this;
        fetch(this.state.movie, {
                method: 'delete',
                credentials: 'same-origin',
                headers: new Headers({
                    'Authorization': 'Basic',
                    'Content-Type': 'application/json',
                })
            }
        ).then(function (response) {
            if (response.status === 401) {
                that.setState({auth: false});
            } else {
                if (that.state.favourite === 1) {
                    that.setState({
                        numberFavourite: that.state.numberFavourite - 1,
                        favouriteColor: 'inherit',
                    })
                }
                if (that.state.status === 1) {
                    that.setState({
                        numberWantToSee: that.state.numberWantToSee - 1,
                        wantToSeeColor: 'inherit',
                    })
                } else if (that.state.status === 2) {
                    that.setState({
                        numberSeen: that.state.numberSeen - 1,
                        seenColor: 'inherit',
                    })
                }
                if (that.state.rating !== 0) {
                    that.setState({
                        averageRating: (that.state.averageRating * that.state.numberOfRatings - that.state.rating) / (that.state.numberOfRatings - 1),
                        numberOfRatings: that.state.numberOfRatings - 1,
                    })
                }
                that.setState({
                    rating: 0,
                    status: 0,
                    favourite: 0,
                    movie: '',
                    review: '',
                    alertOpen: false,
                    snackBar: 'Removed from your movies'
                })
            }
        });
    };

    addToFavourites = () => {
        const that = this;
        fetch(this.state.movie, {
                method: 'PATCH',
                credentials: 'same-origin',
                body: JSON.stringify({
                    fav: 1,
                }),
                headers: new Headers({
                    'Authorization': 'Basic',
                    'Content-Type': 'application/json',
                })
            }
        ).then(function (response) {
            if (response.status === 401) {
                that.setState({auth: false});
            } else {
                that.setState({
                    favourite: 1,
                    numberFavourite: that.state.numberFavourite + 1,
                    favouriteColor: 'primary',
                    snackBar: 'Added to favourites'
                })
            }
        });
    };

    rate = score => {

        if (score === this.state.rating) {
            score = 0;
        }
        const that = this;
        fetch(this.state.movie, {
                method: 'PATCH',
                credentials: 'same-origin',
                body: JSON.stringify({
                    score: score,
                }),
                headers: new Headers({
                    'Authorization': 'Basic',
                    'Content-Type': 'application/json',
                })
            }
        ).then(response => {
            if (response.status === 401) {
                that.setState({auth: false});
            } else {
                if (score !== 0 && that.state.rating === 0) {
                    if (isNaN(that.state.averageRating) || isNaN(that.state.numberOfRatings)) {
                        that.state.averageRating = 0;
                        that.state.numberOfRatings = 0;
                    }
                    that.setState({
                        averageRating: (that.state.averageRating * that.state.numberOfRatings + score) / (that.state.numberOfRatings + 1),
                        numberOfRatings: that.state.numberOfRatings + 1,
                        rating: score,
                    })
                } else if (score !== 0 && that.state.rating !== 0) {
                    that.setState({
                        averageRating: (that.state.averageRating * that.state.numberOfRatings - that.state.rating + score) / (that.state.numberOfRatings),
                        rating: score,
                    })
                } else if (score === 0 && that.state.rating !== 0) {
                    that.setState({
                        averageRating: (that.state.averageRating * that.state.numberOfRatings - that.state.rating) / (that.state.numberOfRatings - 1),
                        numberOfRatings: that.state.numberOfRatings - 1,
                        rating: score,
                    })
                }
            }
        });
    };

    removeFromFavourites = () => {
        const that = this;
        fetch(this.state.movie, {
                method: 'PATCH',
                credentials: 'same-origin',
                body: JSON.stringify({
                    fav: 0,
                }),
                headers: new Headers({
                    'Authorization': 'Basic',
                    'Content-Type': 'application/json',
                })
            }
        ).then(response => {
            if (response.status === 401) {
                that.setState({auth: false});
            } else {
                that.setState({
                    favourite: 0,
                    numberFavourite: that.state.numberFavourite - 1,
                    favouriteColor: 'inherit',
                    snackBar: 'Removed from favourites'
                })
            }
        });
    };

    saveReview = event => {
        event.preventDefault();
        this.setState({review: this.state.newReview});

        const that = this;
        fetch(this.state.movie, {
                method: 'PATCH',
                credentials: 'same-origin',
                body: JSON.stringify({
                    notes: this.state.newReview,
                }),
                headers: new Headers({
                    'Authorization': 'Basic',
                    'Content-Type': 'application/json',
                })
            }
        ).then(response => {
            if (response.status === 401) {
                that.setState({auth: false});
            } else {
                that.setState({
                    writeReview: false,
                    snackBar: 'Review saved'
                })
            }
        });
    };

    removeReview = () => {
        this.setState({
            newReview: '',
            review: '',
            removeAlertOpen: false
        });

        const that = this;
        fetch(this.state.movie, {
                method: 'PATCH',
                credentials: 'same-origin',
                body: JSON.stringify({
                    notes: '',
                }),
                headers: new Headers({
                    'Authorization': 'Basic',
                    'Content-Type': 'application/json',
                })
            }
        ).then(response => {
            if (response.status === 401) {
                that.setState({auth: false});
            } else {
                that.setState({
                    writeReview: false,
                    snackBar: 'Review removed'
                })
            }
        });
    };


    inputChanged = event => {
        this.setState({[event.target.name]: event.target.value});
    };

    getMovieFromTmdb = tmdbId => {
        const that = this;
        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tmdb/movie/${tmdbId}`, {
                method: 'get',
                credentials: 'same-origin',
                headers: new Headers({
                    'Authorization': 'Basic',
                    'Content-Type': 'application/json',
                })
            }
        ).then(response => {
            if (response.status === 401) {
                that.setState({auth: false});
            } else {
                response.json().then(responseData => {
                    let releaseDate, releaseYear, language;
                    if(responseData.release_date) {
                        releaseDate = responseData.release_date.split('-').join('/');
                        releaseYear = releaseDate.split('/')[0];
                    } else {
                        releaseDate = "0000/00/00";
                        releaseYear = "";
                    }

                    if(responseData.original_language === "cn") {
                        language = "Cantonese";
                    } else {
                        language = langs.where("1", responseData.original_language).name;
                    }

                    that.setState({
                        tmdbMovie: responseData,
                        countries: responseData.production_countries,
                        cast: responseData.credits.cast,
                        staff: responseData.credits.crew,
                        releaseDate: releaseDate,
                        releaseYear: releaseYear,
                        language: language,
                        productionCompanies: responseData.production_companies,
                        genres: responseData.genres,
                    });
                    that.props.setDrawerHeight();
                    window.scrollTo(0, 0);
                })
            }
        });
    };

    getMovieStats = tmdbId => {
        const that = this;
        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/movies?tmdbId=${tmdbId}&size=2000`, {
                method: 'get',
                credentials: 'same-origin',
                headers: new Headers({
                    'Authorization': 'Basic',
                    'Content-Type': 'application/json',
                })
            }
        ).then(response => {
            if (response.status === 401) {
                that.setState({auth: false});
            } else {
                response.json().then(responseData => {
                    let total = 0, length = 0, score = 0;
                    for (let i = 0; i < responseData['_embedded'].movies.length; i++) {
                        score = responseData['_embedded'].movies[i].score;
                        total += score;
                        if (score !== 0) {
                            length++;
                        }
                    }
                    let averageRating = total / length;
                    if (isNaN(averageRating)) {
                        averageRating = 0;
                    }
                    const reviews = responseData['_embedded'].movies.filter(movie => movie.notes !== '' && movie.notes !== null && movie._embedded.user.username !== that.props.username);
                    that.setState({
                        numberSeen: responseData['_embedded'].movies.filter(value => value.status === 2).length,
                        numberWantToSee: responseData['_embedded'].movies.filter(value => value.status === 1).length,
                        numberFavourite: responseData['_embedded'].movies.filter(value => value.fav === 1).length,
                        averageRating: averageRating,
                        numberOfRatings: length,
                        movies: responseData['_embedded'].movies,
                        reviews: reviews,
                        numberOfReviews: reviews.length
                    });
                    that.props.setDrawerHeight();
                    window.scrollTo(0, 0);
                })
            }
        });
    };

    dialogClose = () => {
        this.setState({
            alertOpen: false,
            removeAlertOpen: false,
        });
    };

    buttonPageClick = pageNumber => {
        switch(pageNumber) {
            case 'PRE':
                this.setState({reviewPage: this.state.reviewPage - 1});
                break;
            case 'NEXT':
                this.setState({reviewPage: this.state.reviewPage + 1});
                break;
            default:
                this.setState({reviewPage: pageNumber});
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
                color={`${this.state.reviewPage === pageNumber ? 'primary' : 'inherit'}`}
            >
                {pageNumber}
            </Button>
        );
    };

    render() {

        const {classes, username} = this.props;
        const {
            status,
            favourite,
            tmdbMovie,
            cast,
            staff,
            productionCompanies,
            countries,
            releaseDate,
            releaseYear,
            language,
            numberSeen,
            numberWantToSee,
            numberFavourite,
            averageRating,
            wantToSeeColor,
            seenColor,
            favouriteColor,
            review,
            writeReview,
            alertOpen,
            rating,
            numberOfRatings,
            reviewPage,
            reviews,
            numberOfReviews,
            newReview,
            actionsLoading,
            remove,
            snackBar,
            removeAlertOpen,
            detailsLoading,
            genres
        } = this.state;

        const castList = cast.slice(0, 6).map((cast, index) =>
            <Grid key={index} item xs={6} md={6} lg={4}>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar
                            src={cast.profile_path ? 'https://image.tmdb.org/t/p/w138_and_h175_face' + cast.profile_path : null}
                        >
                            {cast.profile_path ? null : !cast.name.split(' ')[1] ? cast.name.charAt(0) : cast.name.charAt(0) + cast.name.split(' ')[1].charAt(0)}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={cast.name}
                        secondary={cast.character}
                    />
                </ListItem>
            </Grid>
        );

        const staffList = staff.slice(0, 6).map((staff, index) =>
            <Grid key={index} item xs={6} md={6} lg={4}>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar
                            src={staff.profile_path ? 'https://image.tmdb.org/t/p/w138_and_h175_face' + staff.profile_path : null}
                        >
                            {staff.profile_path ? null : !staff.name.split(' ')[1] ? staff.name.charAt(0) : staff.name.charAt(0) + staff.name.split(' ')[1].charAt(0)}
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary={staff.name}
                        secondary={staff.job}
                    />
                </ListItem>
            </Grid>
        );

        const countryList = countries.map((country, index) =>
            <Grid key={index} item xs={6} md={6} lg={4}>
                <ListItem>
                    <ListItemText
                        primary={country.name}
                        secondary='Origin country'
                    />
                </ListItem>
            </Grid>
        );

        const companyList = productionCompanies.map((company, index) =>
            <Grid key={index} item xs={6} md={6} lg={4}>
                <ListItem>
                    <ListItemText
                        primary={company.name}
                        secondary='Production company'
                    />
                </ListItem>
            </Grid>
        );

        const genreList = genres.map((genre, index) =>
            <Grid key={index} item xs={6} md={6} lg={4}>
                <ListItem>
                    <ListItemText
                        primary={genre.name}
                    />
                </ListItem>
            </Grid>
        );

        const reviewList = reviews.slice((reviewPage - 1) * 6, reviewPage * 6).map((movie, index) =>
            <Grid key={index} item xs={12} className={classes.reviewGrid}>
                <div>
                    <Card>
                        <CardHeader
                            className={classes.reviewCard}
                            subheader={
                                <div>
                                    Review by <Link to={'/user/' + movie._embedded.user.username}>{movie._embedded.user.username}</Link>
                                </div>
                            }
                            action={
                                <Rating
                                    iconHovered={(<Star style={{color: orange[500]}}/>)}
                                    value={movie.score}
                                    max={5}
                                    readOnly
                                />
                            }
                        />
                        <CardContent>
                            <Typography>
                                {nl2br(movie.notes)}
                            </Typography>
                        </CardContent>
                    </Card>
                </div>
            </Grid>
        );

        return (
            <div className={classes.root}>
                <Snackbar
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                    open={(snackBar !== '' ? ( true ) : ( false ) )}
                    onClose={() => this.setState({snackBar: ''})}
                    SnackbarContentProps={{
                        'aria-describedby': 'message-id',
                        style: {
                            backgroundColor: this.props.theme.palette.primary.main,
                            color: 'white'
                        }
                    }}
                    message={<span id="message-id">{snackBar}</span>}
                    autoHideDuration={3000}
                />
                <Dialog
                    fullWidth
                    maxWidth="md"
                    open={alertOpen}
                    onClose={this.dialogClose}
                    aria-labelledby='alert-dialog-title'
                    aria-describedby='alert-dialog-description'
                >
                    <DialogTitle id='alert-dialog-title'>
                        Remove the movie from your seen movies?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id='alert-dialog-description'>
                            By removing the movie from your list of seen movies, your review will also be removed.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.dialogClose} color='primary'>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => (
                                remove ? (
                                    this.removeFromSeen()
                                ) : (
                                    this.addToWanted()
                                )
                            )}
                            color='primary'
                            autoFocus
                        >
                            Continue
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog
                    fullWidth
                    maxWidth="md"
                    open={removeAlertOpen}
                    onClose={this.dialogClose}
                    aria-labelledby='alert-dialog-title'
                    aria-describedby='alert-dialog-description'
                >
                    <DialogTitle id='alert-dialog-title'>
                        Remove your review?
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id='alert-dialog-description'>
                            Are you sure you want to remove your review? This can't be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.dialogClose} color='primary'>
                            Cancel
                        </Button>
                        <Button
                            onClick={this.removeReview}
                            color='primary'
                            autoFocus
                        >
                            Continue
                        </Button>
                    </DialogActions>
                </Dialog>


                <Grid container spacing={24}>
                    <Grid item xs={12} lg={4} md={5} sm={12}>
                        <Card className={classes.movieCard}>
                            <Image
                                src={tmdbMovie.poster_path ? 'https://image.tmdb.org/t/p/w780' + tmdbMovie.poster_path : ' '}
                                title={tmdbMovie.title}
                                aspectRatio={500 / 750}
                                color='#777'
                            />
                            <CardContent>
                                <Typography
                                    gutterBottom
                                    variant='headline'
                                    component='h2'
                                >
                                    {tmdbMovie.title} {releaseYear ? ( '(' + releaseYear + ')' ) : null}
                                </Typography>
                                <Typography variant='caption' component='div' noWrap>
                                    <Rating
                                        iconHovered={(<Star style={{color: orange[500]}}/>)}
                                        value={Math.ceil(averageRating * 2) / 2}
                                        max={5}
                                        readOnly
                                    />
                                    {numberOfRatings === 1 ? (
                                        <div>Based on {numberOfRatings} rating</div>
                                    ) : numberOfRatings > 1 ? (
                                        <div>Based on {numberOfRatings} ratings</div>
                                    ) : (
                                        <div>No ratings yet</div>
                                    )
                                    }
                                </Typography>

                                {actionsLoading ? (
                                    <div className={classes.actions}>
                                        <LinearProgress className={classes.actionsLoading} />
                                    </div>
                                ) : (
                                    <Grid
                                        container
                                        className={classes.actions}
                                        spacing={8}
                                    >
                                        <Grid item xs={4} lg={4} md={4} sm={4}>
                                            <Tooltip title="Seen">
                                                <Button
                                                    onClick={() => (
                                                        status === 0 || status === 1 ? (
                                                            this.addToSeen()
                                                        ) : review !== '' && status === 2 ? (
                                                            this.setState({
                                                                remove: true,
                                                                alertOpen: true
                                                            })
                                                        ) : (
                                                            this.removeFromSeen()
                                                        )
                                                    )}>
                                                    <VisibilityIcon
                                                        color={seenColor}
                                                        style={{marginRight: 8}}/>
                                                    {numberSeen}
                                                </Button>
                                            </Tooltip>
                                        </Grid>
                                        <Grid item xs={4} lg={4} md={4} sm={4}>
                                            {(status === 2) ?
                                                <Tooltip title="Favourite">
                                                    <Button
                                                        onClick={() => (
                                                            favourite === 0 ? (
                                                                this.addToFavourites()
                                                            ) : (
                                                                this.removeFromFavourites()
                                                            )
                                                        )}
                                                    >
                                                        <FavoriteIcon
                                                            color={favouriteColor}
                                                            style={{marginRight: 8}}
                                                        />
                                                        {numberFavourite}
                                                    </Button>
                                                </Tooltip>
                                                :
                                                <Typography component='div' noWrap>
                                                    <Tooltip title="Favourite">
                                                        <div className={this.props.classes.favourite}>
                                                            <FavoriteIcon
                                                                color={favouriteColor}
                                                                style={{marginRight: 8}}
                                                            />
                                                            {numberFavourite}
                                                        </div>
                                                    </Tooltip>
                                                </Typography>
                                            }
                                        </Grid>
                                        <Grid item xs={4} lg={4} md={4} sm={4}>
                                            <Tooltip title="See later">
                                                <Button
                                                    onClick={() => (
                                                        status !== 1 && review === '' ? (
                                                            this.addToWanted()
                                                        ) : status === 2 && review !== '' ? (
                                                            this.setState({
                                                                remove: false,
                                                                alertOpen: true
                                                            })
                                                        ) : (
                                                            this.removeFromSeen()
                                                        )
                                                    )}>
                                                    <WatchLaterIcon
                                                        color={wantToSeeColor}
                                                        style={{marginRight: 8}}
                                                    />
                                                    {numberWantToSee}
                                                </Button>
                                            </Tooltip>
                                        </Grid>
                                    </Grid>
                                )}

                                {tmdbMovie.homepage ? (
                                    <Button
                                        style={{marginTop: 10}}
                                        href={tmdbMovie.homepage}>
                                        Visit the movie's homepage
                                    </Button>
                                ) : null}

                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} lg={8} md={7} sm={12}>
                        <Card className={classes.detailsCard}>
                            <CardContent>
                                {detailsLoading ? (
                                    <div className={classes.detailsLoading}>
                                        <CircularProgress/>
                                    </div>
                                ) : (
                                    <div>
                                        <Typography gutterBottom variant='subheading' component='h2'>
                                            Overview
                                        </Typography>
                                        <Typography component='p'>
                                            {tmdbMovie.overview}
                                        </Typography>
                                        <br/>
                                        <Typography gutterBottom variant='subheading' component='h2'>
                                            Info
                                        </Typography>
                                        <Grid container spacing={16}>
                                            {releaseDate ? (
                                                <Grid item xs={6} md={6} lg={4}>
                                                    <ListItem>
                                                        <ListItemText
                                                            primary={releaseDate}
                                                            secondary='Release date'
                                                        />
                                                    </ListItem>
                                                </Grid>
                                            ) : (null)}

                                            {countryList}
                                            <Grid item xs={6} md={6} lg={4}>
                                                <ListItem>
                                                    <ListItemText
                                                        primary={language}
                                                        secondary='Original language'
                                                    />
                                                </ListItem>
                                            </Grid>
                                            {companyList}
                                        </Grid>
                                        <br/>
                                        <Typography gutterBottom variant='subheading' component='h2'>
                                            Genres
                                        </Typography>
                                        <Grid container spacing={16}>
                                            {genreList}
                                        </Grid>
                                        <br/>
                                        <Typography gutterBottom variant='subheading' component='h2'>
                                            Main Staff
                                        </Typography>
                                        <Grid container spacing={16}>
                                            {staffList}
                                        </Grid>
                                        <br/>
                                        <Typography gutterBottom variant='subheading' component='h2'>
                                            Main Cast
                                        </Typography>
                                        <Grid container spacing={16}>
                                            {castList}
                                        </Grid>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <br/>
                        <Card className={classes.detailsCard}>
                            <CardContent>
                                {detailsLoading ? (
                                    <div className={classes.detailsLoading}>
                                        <CircularProgress/>
                                    </div>
                                ) : (
                                    <div>
                                        {status === 2 ? (
                                            <div>
                                                <Typography gutterBottom variant='subheading' component='h2'>
                                                    Rate and review
                                                </Typography>
                                            </div>
                                        ) : null}
                                        <div className={classes.writeReview}>
                                            {review && !writeReview ? (
                                                <div>
                                                    <Card>
                                                        <CardHeader
                                                            subheader={
                                                                <div>
                                                                    Review by <Link to={'/user/' + username}>{username}</Link>
                                                                </div>
                                                            }
                                                            action={
                                                                <Rating
                                                                    iconHovered={(<Star style={{color: orange[500]}}/>)}
                                                                    value={rating}
                                                                    max={5}
                                                                    onChange={(score) => this.rate(score)}
                                                                />
                                                            }
                                                        />
                                                        <CardContent>
                                                            <Typography>
                                                                {nl2br(review)}
                                                            </Typography>
                                                        </CardContent>
                                                    </Card>
                                                    <Button
                                                        variant='raised'
                                                        color='primary'
                                                        className={classes.buttonLeft}
                                                        onClick={() => {
                                                            this.setState({newReview: review});
                                                            this.setState({writeReview: true});
                                                        }}
                                                    >
                                                        Change your review
                                                    </Button>
                                                </div>
                                            ) : status === 2 ? (
                                                <Rating
                                                    iconHovered={(<Star style={{color: orange[500]}}/>)}
                                                    value={rating}
                                                    max={5}
                                                    onChange={(score) => this.rate(score)}
                                                />
                                            ) : (null)}
                                            {writeReview ? (
                                                <div>
                                                    <ValidatorForm
                                                        ref="form"
                                                        onError={errors => console.log(errors)}
                                                        onSubmit={this.saveReview}
                                                    >
                                                        <TextValidator
                                                            name='newReview'
                                                            multiline
                                                            rows='15'
                                                            label='Your review'
                                                            defaultValue={review}
                                                            value={newReview}
                                                            className={classes.reviewField}
                                                            margin='normal'
                                                            onChange={this.inputChanged}
                                                            validators={['maxStringLength:2000']}
                                                            errorMessages={['Must be less than 2000 characters']}
                                                        />
                                                        <Button
                                                            type='submit'
                                                            variant='raised'
                                                            color='primary'
                                                            className={classes.buttonRight}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            variant='raised'
                                                            color='primary'
                                                            className={classes.buttonRight}
                                                            onClick={() => {
                                                                this.setState({removeAlertOpen: true})
                                                            }}
                                                        >
                                                            Remove
                                                        </Button>
                                                        <Button
                                                            variant='raised'
                                                            color='primary'
                                                            className={classes.buttonRight}
                                                            onClick={() => {
                                                                this.setState({writeReview: false})
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </ValidatorForm>
                                                </div>
                                            ) : null}
                                            {status === 2 && review === '' && !writeReview ? (
                                                <div>
                                                    <Button
                                                        type='submit'
                                                        variant='raised'
                                                        color='primary'
                                                        className={classes.buttonLeft}
                                                        onClick={() => {
                                                            this.setState({writeReview: true})
                                                        }}
                                                    >
                                                        Write a review
                                                    </Button>
                                                </div>
                                            ) : null}
                                        </div>
                                        <Typography gutterBottom variant='subheading' component='h2'>
                                            Reviews
                                        </Typography>
                                        <Grid container spacing={16}>
                                            {numberOfReviews > 0 ? (
                                                reviewList
                                            ) : review === '' ? (
                                                <Grid item><Typography component='p'>No reviews yet</Typography></Grid>
                                            ) : (
                                                <Grid item><Typography component='p'>No other reviews yet</Typography></Grid>
                                            )}
                                        </Grid>
                                        {numberOfReviews > 6 ? (
                                            <div className={classes.pagination}>
                                                <Pagination
                                                    total={numberOfReviews}
                                                    selectedPageId={reviewPage}
                                                    renderBtnNumber={this.renderBtnNumber}
                                                    maxBtnPerSide={2}
                                                    maxBtnNumbers={4}
                                                    counterStyle={{display: 'none'}}
                                                    itemPerPage={6}
                                                />
                                            </div>
                                        ) : (null)}
                                    </div>)}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles, {withTheme: true})(MoviePage);