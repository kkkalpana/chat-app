# Chat Application (Backend)

This is the backend service for a real-time chat application built with Node.js, Express, Socket.IO, and MongoDB Atlas.  
Users can join groups, send messages, leave groups, and see online members.  
Admins have additional permissions to create groups.

---

## Features

### Authentication & Authorization

- User registration and login using JWT.
- Protected routes using authentication middleware.
- Admin-only actions (e.g., group creation).

### Users

- Login / logout
- Join groups
- Leave groups
- View online members in a group

### Groups

- Admins can create groups.
- Users can view available groups.
- Users can join or leave groups.

### Messages

- Real-time messaging using Socket.IO.
- Fetch past messages from database.
- Store chat history in MongoDB Atlas.

### Database

- MongoDB Atlas (cloud database)
- Collections:
  - Users
  - Groups
  - Messages

---

## Technology Stack

- Node.js
- Express.js
- Socket.IO
- MongoDB Atlas (Mongoose)
- JSON Web Tokens (JWT)
- Bcrypt (password hashing)

---

## Project Structure
