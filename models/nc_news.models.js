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

exports.insertTopic = (topic) => {
	const requiredProperties = ['slug', 'description'];
	for (const prop of requiredProperties) {
		if (!topic.hasOwnProperty(prop)) {
			return Promise.reject({
				status: 400,
				msg: 'topic format not valid',
			});
		}
	}
	const { slug, description } = topic;

	const query = `
	INSERT INTO topics
	(slug, description)
	VALUES
	($1,$2)
	RETURNING *
	`;

	return db.query(query, [slug, description]).then((result) => {
		return result.rows[0];
	});
};

exports.fetchUsers = () => {
	const query = `
	SELECT * FROM users;`;
	return db.query(query).then((result) => {
		return result.rows;
	});
};

exports.fetchUserById = async (username) => {
	await checkExists('users', 'username', username);
	const query = `
	SELECT username,name,avatar_url FROM users
	WHERE username = $1
	`;
	return db.query(query, [username]).then((result) => {
		return result.rows[0];
	});
};

exports.fetchArticles = async (topic, sort_by, order, p, limit) => {
	const queryValues = [];
	sort_by = sort_by || 'created_at';
	order = order || 'desc';
	limit = limit || 10;
	p = p || 1;
	if (!Number(p)) {
		return Promise.reject({
			status: 400,
			msg: 'page must be a number',
		});
	}
	if (!Number(limit)) {
		return Promise.reject({
			status: 400,
			msg: 'limit must be a number',
		});
	}
	if (
		![
			'title',
			'topic',
			'author',
			'body',
			'created_at',
			'votes',
			'article_img_url',
			'comment_count',
		].includes(sort_by)
	) {
		return Promise.reject({ status: 400, msg: 'invalid sort query' });
	}
	if (!['asc', 'desc'].includes(order)) {
		return Promise.reject({ status: 400, msg: 'invalid order query' });
	}

	let query = `
	SELECT articles.author,title,topic,articles.created_at,articles.votes,article_img_url, CAST(COUNT(comments.article_id)AS INT) AS comment_count
	FROM articles
	FULL OUTER JOIN comments ON articles.article_id = comments.article_id
	`;

	if (topic) {
		await checkExists('topics', 'slug', topic);
		queryValues.push(topic);
		query += `WHERE topic = $${queryValues.length}`;
	}

	query += `
	GROUP BY articles.author,title,topic,articles.created_at,articles.votes,article_img_url
	ORDER BY ${sort_by} ${order}
	`;

	return db.query(query, queryValues).then((result) => {
		const total_count = result.rows.length;
		const offset = (p - 1) * limit;
		queryValues.push(limit, offset);
		query += `LIMIT $${queryValues.length - 1} OFFSET $${
			queryValues.length
		}`;
		return db.query(query, queryValues).then((result) => {
			return { result: result.rows, total_count };
		});
	});
};

exports.insertArticle = async (articleInput) => {
	const requiredProperties = ['author', 'title', 'body', 'topic'];
	for (const prop of requiredProperties) {
		if (!articleInput.hasOwnProperty(prop)) {
			return Promise.reject({
				status: 400,
				msg: 'article format not valid',
			});
		}
	}
	if (!articleInput.hasOwnProperty('article_img_url')) {
		articleInput.article_img_url = 'https://i.imgur.com/QzScpiy.png';
	}

	const { author, title, body, topic, article_img_url } = articleInput;

	await checkExists('users', 'username', author);
	await checkExists('topics', 'slug', topic);

	const insertQuery = `
	INSERT INTO articles
	(author,title,body,topic,article_img_url)
	VALUES
	($1,$2,$3,$4,$5)
	RETURNING *
	`;

	const selectQuery = `
	SELECT articles.article_id,articles.author,articles.title,articles.topic,articles.body,articles.created_at,articles.votes,article_img_url, CAST(COUNT(comments.article_id)AS INT) AS comment_count
	FROM articles
	FULL OUTER JOIN comments ON articles.article_id = comments.article_id
	WHERE articles.article_id = $1
	GROUP BY articles.article_id,articles.author,articles.title,articles.topic,articles.body,articles.created_at,articles.votes,article_img_url
	`;

	return db
		.query(insertQuery, [author, title, body, topic, article_img_url])
		.then((response) => {
			const insertedId = response.rows[0].article_id;
			return db.query(selectQuery, [insertedId]);
		})
		.then((result) => {
			return result.rows[0];
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

exports.removeArticleById = async (article_id) => {
	if (!Number(article_id)) {
		return Promise.reject({
			status: 400,
			msg: 'article_id must be a number',
		});
	}
	await checkExists('articles', 'article_id', article_id);

	const queryComments = `
	DELETE FROM comments
	WHERE article_id = $1;
	`;

	const queryArticles = `
	DELETE FROM articles
	WHERE article_id = $1;
	`;

	return db
		.query(queryComments, [article_id])
		.then(() => {
			return db.query(queryArticles, [article_id]);
		})
		.then((result) => {
			if (result.rowCount !== 0) {
				return true;
			}
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

exports.modifyCommentById = async (comment_id, inc_votes) => {
	if (!Number(comment_id)) {
		return Promise.reject({
			status: 400,
			msg: 'comment_id must be a number',
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
	await checkExists('comments', 'comment_id', comment_id);
	const query = `
	UPDATE comments
	SET votes = $1 + votes
	WHERE comment_id = $2
	RETURNING *;
	`;
	return db.query(query, [inc_votes, comment_id]).then((result) => {
		return result.rows[0];
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