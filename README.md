# Northcoders News API

#### Hosted Version: [https://nc-news-ej32.onrender.com](https://nc-news-ej32.onrender.com)

## Description

Northcoders News is a social news aggregation, web content rating, and discussion website. Think something along the lines of Reddit.

Northcoders News has articles which are divided into topics. Each article has user curated ratings and can be up or down voted using the API. Users can also add comments about an article. Comments can also be up or down voted. A user can add comments and remove any comments which they have added.

## Setup

### 1. Clone repo
```
git clone https://github.com/Proc31/nc-news
```
### 2. Install required packages
```
npm install
```
### 3. Setup test database
```
npm run setup-dbs
```
### 4. Create .ENV files

To connect to either the test database or the development database please create .env.development & .env.test files and include the line PGDATABASE=nc_news or PGDATABASE=nc_news_test respectively in each file.

### 5. Seed database
```
npm run seed
```

### 6. Run tests (Seeded with test data)
```
npm run test
```

## Version requirements

#####Node.js 
```
20.5.1
```
#####Postgres
```
PSQL Version: 14.9
Server Version: 16.0
```