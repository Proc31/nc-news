const express = require('express');
const { getTopics } = require('./controllers/nc_news.controllers');

const app = express();
app.use(express.json());

app.get('/api/topics', getTopics);

// Custom Errors
app.use((err, req, res, next) => {
	if (err.status && err.msg) {
		res.status(err.status).send({ msg: err.msg });
	} else {
		next(err);
	}
});

// Server Errors
app.use((err, req, res, next) => {
	res.status(400).send({ msg: 'Bad request' });
});

module.exports = app;
