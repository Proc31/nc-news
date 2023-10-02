const express = require('express');
const { getApi, getTopics } = require('./controllers/nc_news.controllers');

const app = express();

app.get('/api', getApi);
app.get('/api/topics', getTopics);

module.exports = app;


