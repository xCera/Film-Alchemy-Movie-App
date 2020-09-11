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
	axios
		.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.apikey}&language=en-US&page=1`)
		.then((response) => {
			let now_playing_films = response.data.results;
			let randomFilm = now_playing_films[randomNum(now_playing_films.length)];
			let filmGenres = [];
			randomFilm.genre_ids.forEach((zanr) => {
				filmGenres.push(genres.find((genre) => genre.id == zanr));
			});
			res.render('home', { film: randomFilm, genres: filmGenres });
		})
		.catch((err) => {
			console.log(err);
			res.redirect('/');
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
	axios
		.get(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${process.env.apikey}&language=en-US`)
		.then((response) => {
			let film = response.data;
			console.log(film);
			res.render('show', { film: film });
		})
		.catch((err) => console.log(err));
});

function randomNum(length) {
	let random_num = Math.round(length * Math.random());
	return random_num;
}

app.listen(process.env.port, () => console.log(`App listening on port port!`));
