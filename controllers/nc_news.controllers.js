const api = require('../endpoints.json');
const {
	fetchTopics,
	fetchArticleById,
	fetchComments,
	fetchArticles,
	removeCommentById,
} = require('../models/nc_news.models');

exports.getApi = (req, res, next) => {
	res.status(200).send({ api });
};

exports.getTopics = (req, res, next) => {
	return fetchTopics()
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

exports.getArticles = (req, res, next) => {
	fetchArticles().then((data) => {
		res.status(200).send({ articles: data });
	});
};

exports.getCommentsByArticleId = (req, res, next) => {
	const { article_id } = req.params;
	fetchComments(article_id)
		.then((response) => {
			res.status(200).send({ comments: response });
		})
		.catch((err) => {
			next(err);
		});
};

exports.deleteCommentById = (req, res, next) => {
	const { comment_id } = req.params;
	removeCommentById(comment_id)
		.then((response) => {
			if (response) {
				res.status(204).send();
			}
		})
		.catch((err) => {
			next(err);
		});
};