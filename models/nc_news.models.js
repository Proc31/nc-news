const db = require('../db/connection');
const api = require('../endpoints.json');

exports.fetchApi = () => {
	return { api };
};

exports.fetchTopics = () => {
	const query = `
    SELECT * FROM topics;
    `;
	return db.query(query).then((result) => {
		return result.rows;
	});
};

