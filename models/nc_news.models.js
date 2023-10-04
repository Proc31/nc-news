const db = require('../db/connection');
const format = require('pg-format');

exports.fetchTopics = () => {
	const query = `
    SELECT * FROM topics;
    `;
	return db.query(query).then((result) => {
		return result.rows;
	});
};

exports.fetchUsers = () => {
	const query = `
	SELECT * FROM users;`;
	return db.query(query).then((result) => {
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

exports.fetchArticleById = async (article_id) => {
	if (!Number(article_id)) {
		return Promise.reject({
			status: 400,
			msg: 'article_id must be a number',
		});
	}
	await checkExists('articles', 'article_id', article_id);

	const query = `
	SELECT articles.author,title,articles.article_id,articles.body,topic,articles.created_at,articles.votes,article_img_url, CAST(COUNT(comments.comment_id) AS INT) AS comment_count
	FROM articles
	JOIN comments ON comments.article_id = articles.article_id
	WHERE articles.article_id = $1
	GROUP BY articles.author,title,articles.article_id,articles.body,topic,articles.created_at,articles.votes,article_img_url
	`;

	return db.query(query, [article_id]).then((result) => {
		return result.rows[0];
	});
};

exports.fetchCommentsByArticleId = async (article_id) => {
	if (!Number(article_id)) {
		return Promise.reject({
			status: 400,
			msg: 'article_id must be a number',
		});
	}
	await checkExists('articles', 'article_id', article_id);

	const query = `
		SELECT * FROM comments
		WHERE article_id = $1
		ORDER BY created_at DESC;
	`;

	return db.query(query, [article_id]).then((result) => {
		return result.rows;
	});
};

exports.insertCommentsByArticleId = async (article_id, username, body) => {
	if (!Number(article_id)) {
		return Promise.reject({
			status: 400,
			msg: 'article_id must be a number',
		});
	}

	await checkExists('articles', 'article_id', article_id);

	const query = `
	INSERT INTO comments
	(body, votes, author, article_id)
	VALUES
	($1, 0, $2, $3)
	RETURNING body, votes, author, article_id, created_at
	;`;

	return db.query(query, [body, username, article_id]).then((result) => {
		return result.rows[0];
	});
};

exports.modifyArticleById = async (article_id, inc_votes) => {
	if (!Number(article_id)) {
		return Promise.reject({
			status: 400,
			msg: 'article_id must be a number',
		});
	}
	if (inc_votes === undefined) {
		return Promise.reject({
			status: 400,
			msg: 'request must include inc_votes key',
		});
	}
	if (!Number(inc_votes)) {
		return Promise.reject({
			status: 400,
			msg: 'inc_votes must be a number',
		});
	}

	await checkExists('articles', 'article_id', article_id);

	const query = `
	UPDATE articles
	SET votes = $1 + votes
	WHERE article_id = $2
	RETURNING *;
	`;

	return db.query(query, [inc_votes, article_id]).then((result) => {
		return result.rows[0];
	});
};

exports.removeCommentById = async (comment_id) => {
	if (!Number(comment_id)) {
		return Promise.reject({
			status: 400,
			msg: 'comment_id must be a number',
		});
	}

	await checkExists('comments', 'comment_id', comment_id);

	const query = `
	DELETE FROM comments
	WHERE comment_id = $1
	`;
	return db.query(query, [comment_id]).then((result) => {
		if (result.rowCount !== 0) {
			return true;
		}
	});
};

const checkExists = async (table, column, value) => {
	const query = format('SELECT * FROM %I WHERE %I = $1', table, column);
	const output = await db.query(query, [value]);
	if (output.rows.length === 0) {
		return Promise.reject({
			status: 404,
			msg: `${column} does not exist`,
		});
	}
};