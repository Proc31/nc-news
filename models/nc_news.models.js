const db = require('../db/connection');

exports.fetchTopics = () => {
	const query = `
    SELECT * FROM topics;
    `;
	return db.query(query).then((result) => {
		return result.rows;
	});
};

exports.fetchArticleById = (article_id) => {
	if (!Number(article_id)) {
		return Promise.reject({
			status: 400,
			msg: 'Article ID must be a number',
		});
	}
	const query = `
	SELECT * FROM articles
	WHERE article_id = $1;
	`;
	return db.query(query, [article_id]).then((result) => {
		if (result.rows.length === 0) {
			return Promise.reject({
				status: 404,
				msg: 'Article ID does not exist',
			});
		}
		return result.rows;
	});
};

exports.fetchComments = (article_id) => {
	if (!Number(article_id)) {
		return Promise.reject({
			status: 400,
			msg: 'Article ID must be a number',
		});
	}
	const query = `
		SELECT * FROM comments
		WHERE article_id = $1
		ORDER BY created_at ASC;
	`;
	return db.query(query, [article_id]).then((result) => {
		if (result.rows.length === 0) {
			return Promise.reject({
				status: 404,
				msg: 'Article ID does not exist',
			});
		}
		return result.rows;
	});
};


exports.fetchArticles = () => {
	const query = `
	SELECT articles.author,title,topic,articles.created_at,articles.votes,article_img_url, CAST(COUNT(comments.article_id)AS INT) AS comment_count
	FROM articles
	JOIN comments ON articles.article_id = comments.article_id
	GROUP BY articles.author,title,topic,articles.created_at,articles.votes,article_img_url
	ORDER BY created_at DESC
	`;
	return db.query(query).then((result) => {
		return result.rows;
	});
};