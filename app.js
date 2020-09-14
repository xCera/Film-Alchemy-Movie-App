const { response } = require('express');

const express = require('express'),
	app = express(),
	axios = require('axios'),
	bodyParser = require('body-parser');

var searched_films;
var genres;

require('dotenv').config();

// ============== APP CONFIG ================
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// ============== ROUTES ================

// GENRES
axios
	.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.apikey}&language=en-US`)
	.then((response) => {
		genres = response.data.genres;
	})
	.catch((err) => console.log(err));

// HOMEPAGE

app.get('/', (req, res) => {
	let movie_id = req.params.id;
	const film_requests = [ 'now_playing', 'popular', 'upcoming', 'top_rated' ];
	let randomFilm, filmGenres, now_playing_films, popular_films, upcoming_films, top_rated;
	film_requests.forEach((film_req) => {
		axios
			.get(`https://api.themoviedb.org/3/movie/${film_req}?api_key=${process.env.apikey}&language=en-US`)
			.then((response) => {
				switch (film_req) {
					case 'now_playing':
						now_playing_films = response.data.results;
						let now_films = response.data.results;
						randomFilm = now_films[randomNum(now_films.length)];
						filmGenres = [];
						randomFilm.genre_ids.forEach((zanr) => {
							filmGenres.push(genres.find((genre) => genre.id == zanr));
						});
						break;
					case 'popular':
						popular_films = response.data.results;
						break;
					case 'upcoming':
						upcoming_films = response.data.results;
						break;
					case 'top_rated':
						top_rated = response.data.results;
						break;
				}
			})
			.catch((err) => console.log(err))
			.then(() => {
				if (
					randomFilm !== undefined &&
					filmGenres !== undefined &&
					now_playing_films !== undefined &&
					popular_films !== undefined &&
					upcoming_films !== undefined &&
					top_rated !== undefined
				) {
					res.render('home', {
						film: randomFilm,
						genres: filmGenres,
						now_playing_films: now_playing_films,
						popular_films: popular_films,
						upcoming_films: upcoming_films,
						top_rated: top_rated
					});
				}
			})
			.catch((err) => console.log(err));
	});
});

// SEARCH
app.get('/search', (req, res) => {
	res.render('search', { films: searched_films });
});

app.post('/search', (req, res) => {
	let title = req.body.title;
	title.replace(/\s+/g, '%20');
	axios
		.get(
			`https://api.themoviedb.org/3/search/movie?api_key=${process.env
				.apikey}&language=en-US&query=${title}&page=1&include_adult=false`
		)
		.then((response) => {
			searched_films = response.data.results;
			res.redirect('/search');
		})
		.catch((err) => {
			console.log(err);
		});
});

// SHOW FILM

app.get('/title/:id', (req, res) => {
	let movie_id = req.params.id;
	const film_requests = [ 'images', 'videos', 'credits', 'recommendations', 'reviews' ];
	let film, images, trailer, cast, crew, recommendedFilms, reviews;
	axios
		.get(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${process.env.apikey}&language=en-US`)
		.then((response) => {
			film = response.data;
			let i = 0;
			for (i = 0; i < film_requests.length; i++) {
				let film_req = film_requests[i];
				axios
					.get(`https://api.themoviedb.org/3/movie/${movie_id}/${film_req}?api_key=${process.env.apikey}`)
					.then((response) => {
						switch (film_req) {
							case 'images':
								images = response.data.backdrops;
								break;
							case 'videos':
								trailer = response.data.results;
								break;
							case 'credits':
								cast = response.data.cast;
								crew = response.data.crew;
								break;
							case 'recommendations':
								recommendedFilms = response.data.results;
								break;
							case 'reviews':
								reviews = response.data.results;
								break;
						}
					})
					.catch((err) => console.log(err))
					.then(() => {
						if (
							images !== undefined &&
							trailer !== undefined &&
							cast !== undefined &&
							crew !== undefined &&
							recommendedFilms !== undefined &&
							reviews !== undefined
						) {
							res.render('show', {
								film: film,
								images: images,
								trailer: trailer,
								cast: cast,
								crew: crew,
								recommendedFilms: recommendedFilms,
								reviews: reviews
							});
						}
					})
					.catch((err) => console.log(err));
			}
		})
		.catch((err) => console.log(err));
});

function randomNum(length) {
	let random_num = Math.round(length * Math.random());
	return random_num;
}

app.listen(process.env.port, () => console.log(`App listening on port port!`));
