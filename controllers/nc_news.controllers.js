const { fetchApi, fetchTopics } = require('../models/nc_news.models');
const api = require('../endpoints.json');

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
