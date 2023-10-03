const api = require('../endpoints.json');
const {
	fetchTopics,
	fetchArticleById,
	fetchCommentsByArticleId,
	fetchArticles,
	insertCommentsByArticleId,
} = require('../models/nc_news.models');

exports.getApi = (req, res, next) => {
	res.status(200).send({ api });
};

exports.getTopics = (req, res, next) => {
	return fetchTopics()
		.then((response) => {
			res.status(200).send({ topics: response });
		})
		.catch((err) => {
			next(err);
		});
};

exports.getArticles = (req, res, next) => {
	fetchArticles().then((response) => {
		res.status(200).send({ articles: response });
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

exports.getCommentsByArticleId = (req, res, next) => {
	const { article_id } = req.params;
	fetchCommentsByArticleId(article_id)
		.then((response) => {
			res.status(200).send({ comments: response });
		})
		.catch((err) => {
			next(err);
		});
};

exports.postCommentsByArticleId = (req, res, next) => {
	const { article_id } = req.params;
	const { username, body } = req.body;
	insertCommentsByArticleId(article_id, username, body)
		.then((response) => {
			res.status(201).send({ comment: response });
		})
		.catch((err) => {
			next(err);
		});
};