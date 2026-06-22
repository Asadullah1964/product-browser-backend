# Product Browser Backend


## Tech Stack

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose


## Features

- Browse 200k products
- Filter by category
- Cursor based pagination
- Fast indexed queries


## Pagination Approach

Used cursor pagination instead of skip/limit.

Products are sorted by:

created_at DESC
_id DESC


Cursor contains last seen product timestamp and id.


This prevents duplicate or missing products when new products are added while browsing.


## Database Index

Created compound index:

category + created_at + _id


This improves filtering and pagination performance.


## Running


npm install

npm run seed

npm run dev