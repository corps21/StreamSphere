# StreamSphere

This project is a comprehensive backend system for a video-sharing platform, similar to YouTube. Built using **Node.js** and **Express**, with **MongoDB** as the database, it includes features like user authentication, video management, commenting, liking, subscribing to channels, tweet-like posts, playlists, and dashboard statistics for channels.

## Features

### User Authentication
- Secure user registration, login, and logout functionalities.
- JWT-based authentication for secure access.

### Video Management
- Upload, update, delete, and fetch videos.
- Support for pagination and sorting.

### Comment System
- Add, update, delete, and fetch comments on videos.

### Like System
- Toggle likes on videos, comments, and tweets.

### Subscription System
- Subscribe and unsubscribe to channels.
- Fetch subscriber and subscription lists.

### Tweet-like Posts
- Create, update, delete, and fetch tweet-like posts.

### Playlists
- Create, update, delete, and manage playlists.

### Dashboard
- Fetch channel statistics and videos.

### Health Check
- Endpoint to check the server's health status.

### File Uploads
- Handle file uploads using **Multer**.
- Store media files in **Cloudinary**.

## Technologies Used

- **Node.js**: JavaScript runtime for building the server-side application.
- **Express**: Web framework for handling routing and middleware.
- **MongoDB**: NoSQL database for storing application data.
- **Mongoose**: ODM for MongoDB to interact with the database.
- **JWT**: JSON Web Tokens for secure authentication.
- **Multer**: Middleware for handling `multipart/form-data` for file uploads.
- **Cloudinary**: Cloud service for storing and managing media files.
- **Nodemon**: Tool for automatically restarting the server during development.

## Getting Started

### Prerequisites

- **Node.js**
- **MongoDB**

### Installation

1. Clone the repo:
   ```bash
   git clone <repository_url>
   ```

2. Install NPM packages:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```env
     DB_URI=<your_mongodb_uri>
     JWT_SECRET=<your_jwt_secret>
     CLOUDINARY_API_KEY=<your_cloudinary_api_key>
     CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
     CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
     ```

4. Start the server:
   ```bash
   npm start
   ```

## Usage

- Use [Postman](https://god.gw.postman.com/run-collection/37280139-b9c55eee-2130-4339-a2c0-7bc8c98cb0fe?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D37280139-b9c55eee-2130-4339-a2c0-7bc8c98cb0fe%26entityType%3Dcollection%26workspaceId%3Dfa0b2ecd-5e0d-48c8-b248-d9faa593ad80) or any API client to interact with the endpoints.
- Refer to the [API Documentation](#) for detailed information on each endpoint.

## License

Distributed under the MIT License. See `LICENSE` for more information.
