const { response } = require('../app');
const api = require('../endpoints.json');
const {
	fetchTopics,
	fetchArticleById,
	fetchCommentsByArticleId,
	fetchArticles,
	removeCommentById,
	insertCommentsByArticleId,
	modifyArticleById,
	fetchUsers,
	fetchUserById,
	modifyCommentById,
	insertArticle,
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

exports.getUsers = (req, res, next) => {
	return fetchUsers().then((response) => {
		res.status(200).send({ users: response });
	});
};

exports.getUserById = (req, res, next) => {
	const { username } = req.params;
	fetchUserById(username)
		.then((response) => {
			res.status(200).send({ user: response });
		})
		.catch((err) => {
			next(err);
		});
};

exports.getArticles = (req, res, next) => {
	const { topic, sort_by, order, p, limit } = req.query;
	fetchArticles(topic, sort_by, order, p, limit)
		.then((response) => {
			res.status(200).send({
				articles: response.result,
				total_count: response.total_count,
			});
		})
		.catch((err) => {
			next(err);
		});
};

exports.postArticle = (req, res, next) => {
	insertArticle(req.body)
		.then((response) => {
			res.status(200).send({ article: response });
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

exports.patchCommentById = (req, res, next) => {
	const { comment_id } = req.params;
	const { inc_votes } = req.body;
	modifyCommentById(comment_id, inc_votes)
		.then((response) => {
			res.status(200).send({ comment: response });
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
    
exports.patchArticleById = (req, res, next) => {
	const { article_id } = req.params;
	const { inc_votes } = req.body;
	modifyArticleById(article_id, inc_votes)
		.then((response) => {
			res.status(200).send({ article: response });
		})
		.catch((err) => {
			next(err);
		});
};
