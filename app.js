const express = require('express');
const {
	getApi,
	getTopics,
	getArticleById,
	getArticles,
} = require('./controllers/nc_news.controllers');

const app = express();

app.get('/api', getApi);
app.get('/api/topics', getTopics);
app.get('/api/articles/:article_id', getArticleById);
app.get('/api/articles', getArticles);

app.use((err, req, res, next) => {
	if (err.status && err.msg) {
		res.status(err.status).send({ msg: err.msg });
	} else {
		next(err);
	}
});

app.use((err, req, res, next) => {
	res.status(500).send({ msg: 'Internal Server Error' });
});

module.exports = app;
