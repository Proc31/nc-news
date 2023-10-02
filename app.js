const express = require('express');
const {
	getApi,
	getTopics,
	getArticleById,
} = require('./controllers/nc_news.controllers');

const app = express();

app.get('/api', getApi);
app.get('/api/topics', getTopics);
app.get('/api/articles/:article_id', getArticleById);

app.use((err, req, res, next) => {
	if (err.status && err.msg) {
		res.status(err.status).send({ msg: err.msg });
	} else {
		next(err);
	}
});

module.exports = app;
