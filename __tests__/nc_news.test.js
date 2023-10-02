const request = require('supertest');
const app = require('../app');
const db = require('../db/connection');
const data = require('../db/data/test-data/index');
const seed = require('../db/seeds/seed');
const endpoints = require('../endpoints.json');
require('jest-sorted');

beforeEach(() => {
	return seed(data);
});

afterAll(() => {
	db.end();
});

describe('Error handling for invalid endpoints', () => {
	test('GET:404 invalid endpoint given', () => {
		return request(app).get('/api/cheese').expect(404);
	});
});

describe('GET /api/topics', () => {
	describe('Endpoint behaviour', () => {
		test('GET:200 expects correct status code', () => {
			return request(app).get('/api/topics').expect(200);
		});
		test('GET:200 expects array of objects with correct keys', () => {
			return request(app)
				.get('/api/topics')
				.expect(200)
				.then(({ body }) => {
					const topics = body.topics;
					expect(topics).toHaveLength(3);
					topics.forEach((topic) => {
						expect(typeof topic.slug).toBe('string');
						expect(typeof topic.description).toBe('string');
					});
				});
		});
	});
});

describe('GET /api', () => {
	describe('Endpoint behaviour', () => {
		test('GET:200 expects correct status code', () => {
			return request(app).get('/api').expect(200);
		});
		test('GET:200 expects response to match endpoints file', () => {
			return request(app)
				.get('/api')
				.expect(200)
				.then(({ body }) => {
					expect(body.api).toEqual(endpoints);
				});
		});
	});
});

describe('GET /api/articles/:article_id', () => {
	describe('Endpoint behaviour', () => {
		test('GET:200 expects correct status code', () => {
			return request(app).get('/api/articles/1').expect(200);
		});
		test('GET:200 expects response to have correct format', () => {
			return request(app)
				.get('/api/articles/1')
				.then(({ body }) => {
					const article = body.article[0];
					expect(typeof article.article_id).toBe('number');
					expect(typeof article.title).toBe('string');
					expect(typeof article.topic).toBe('string');
					expect(typeof article.author).toBe('string');
					expect(typeof article.body).toBe('string');
					expect(typeof article.created_at).toBe('string');
					expect(typeof article.votes).toBe('number');
					expect(typeof article.article_img_url).toBe('string');
				});
		});
		test('GET:200 expects response to have correct content', () => {
			return request(app)
				.get('/api/articles/1')
				.then(({ body }) => {
					const article = body.article[0];
					const articleOne = {
						article_id: 1,
						title: 'Living in the shadow of a great man',
						author: 'butter_bridge',
						topic: 'mitch',
						body: 'I find this existence challenging',
						created_at: '2020-07-09T20:11:00.000Z',
						votes: 100,
						article_img_url:
							'https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700',
					};
					expect(article).toEqual(articleOne);
				});
		});
	});
	describe('Endpoint error handling', () => {
		test('GET:404 expects error when ID does not exist', () => {
			return request(app)
				.get('/api/articles/600')
				.expect(404)
				.then(({ body }) => {
					expect(body.msg).toBe('Article ID does not exist');
				});
		});
		test('GET:400 expects error when ID not a valid type', () => {
			return request(app)
				.get('/api/articles/cheese')
				.expect(400)
				.then(({ body }) => {
					expect(body.msg).toBe('Article ID must be a number');
				});
		});
	});
});

describe('GET /api/articles', () => {
	describe('Endpoint behaviour', () => {
		test('GET:200 expects correct status code', () => {
			return request(app).get('/api/articles').expect(200);
		});
		test('GET:200 expects array of articles with correct keys', () => {
			return request(app)
				.get('/api/articles')
				.then(({ body }) => {
					const articles = body.articles;
					expect(articles).toHaveLength(5);
					articles.forEach((article) => {
						expect(typeof article.author).toBe('string');
						expect(typeof article.title).toBe('string');
						expect(typeof article.topic).toBe('string');
						expect(typeof article.created_at).toBe('string');
						expect(typeof article.votes).toBe('number');
						expect(typeof article.article_img_url).toBe('string');
						expect(typeof article.comment_count).toBe('number');
						expect(article.body).toBeUndefined();
					});
				});
		});
		test('GET:200 expects array of articles with correct comment counts', () => {
			return request(app)
				.get('/api/articles')
				.then(({ body }) => {
					const articles = body.articles;
					const correctArr = [2, 1, 2, 11, 2];
					const testArr = articles.map((article) => {
						return article.comment_count;
					});
					expect(testArr).toEqual(correctArr);
				});
		});
		test('GET:200 expects array of articles with correct default order and sort type', () => {
			return request(app)
				.get('/api/articles')
				.then(({ body }) => {
					const articles = body.articles;
					expect(articles).toBeSortedBy('created_at', {
						descending: true,
					});
				});
		});
	});
});