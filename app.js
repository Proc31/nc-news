const express = require('express');
const {
	getApi,
	getTopics,
	getArticleById,
	getArticles,
	getCommentsByArticleId,
	postCommentsByArticleId,
	patchArticleById,
} = require('./controllers/nc_news.controllers');

const app = express();
app.use(express.json());

app.get('/api', getApi);
app.get('/api/topics', getTopics);
app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id', getArticleById);
app.get('/api/articles/:article_id/comments', getCommentsByArticleId);

app.post('/api/articles/:article_id/comments', postCommentsByArticleId);

app.patch('/api/articles/:article_id', patchArticleById);


app.use((err, req, res, next) => {
	if (err.status && err.msg) {
		res.status(err.status).send({ msg: err.msg });
	} else {
		next(err);
	}
});

app.use((err, req, res, next) => {

	if (err.code === '23503') {
		res.status(400).send({ msg: 'Invalid post contents' });
	} else {
		next(err);
	}
});

app.use((err, req, res, next) => {
	res.status(500).send({ msg: 'Internal Server Error' });
});

module.exports = app;
