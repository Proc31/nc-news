const api = require('../endpoints.json');
const { fetchTopics, fetchArticleById } = require('../models/nc_news.models');

exports.getApi = (req, res, next) => {
	res.status(200).send({ api });
};

exports.getTopics = (req, res, next) => {
	fetchTopics()
		.then((data) => {
			res.status(200).send({ topics: data });
		})
		.catch((err) => {
			next(err);
		});
};

exports.getArticleById = (req, res, next) => {
	const { article_id } = req.params;
	fetchArticleById(article_id)
		.then((response) => {
			res.status(200).send({ article: response });
		})
		.catch((err) => {
			next(err);
		});
};