const express = require('express'),
	app = express(),
	axios = require('axios'),
	bodyParser = require('body-parser');

require('dotenv').config();

// ============== APP CONFIG ================
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

// ============== ROUTES ================
app.get('/', (req, res) => res.send('Hello World!'));

app.listen(process.env.port, () => console.log(`App listening on port port!`));
