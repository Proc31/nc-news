const express = require('express');
const cors = require('cors');
const { getApi } = require('./controllers/nc_news.controllers');

const articlesRouter = require('./routers/articles-router');
const commentsRouter = require('./routers/comments-router');
const topicsRouter = require('./routers/topics-router');
const usersRouter = require('./routers/users-router');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api', getApi);

app.use('/api/topics', topicsRouter);
app.use('/api/users', usersRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/comments', commentsRouter);

app.use((err, req, res, next) => {
	if (err.status && err.msg) {
		res.status(err.status).send({ msg: err.msg });
	} else {
		next(err);
	}
});


app.use((err, req, res, next) => {
	// Error code for when SQL detects invalid type
	if (err.code === '23503') {
		res.status(400).send({ msg: 'Invalid post contents' });
	} else {
		next(err);
	}
});

app.use((err, req, res, next) => {
	console.log(err);
	res.status(500).send({ msg: 'Internal Server Error' });
});

module.exports = app;
