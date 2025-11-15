# Chat Application (Backend)

This is the backend for a real-time chat application built using Node.js, Express, MongoDB Atlas, and Socket.IO.  
The project follows the MVC architecture to keep routing, controllers, and business logic clean and maintainable.

Users can join and leave groups, send messages, view online members, and authenticate using JWT.  
Admins have elevated permissions to create groups.

---

## Architecture

This backend follows the **MVC pattern**:

- **Models** – MongoDB schemas (Users, Groups, Messages)
- **Controllers** – Handle logic for users, groups, and messages
- **Routes** – API endpoints mapped to controllers
- **Middleware** – Authentication, authorization, validation
- **Sockets** – Real-time messaging and online presence
- **Config** – Database connection and environment setup

---

## Features

### Authentication & Authorization
- JWT-based login and protected routes
- Password hashing with bcrypt
- Admin-only actions (group creation)

### Users
- Register, login, logout
- Join groups
- Leave groups
- View online users inside groups

### Groups
- Admins can create groups
- Users can browse available groups
- Join / leave groups

### Messages
- Real-time communication through Socket.IO
- Fetch previous messages from MongoDB
- Store chat history per group

### Database
- MongoDB Atlas cloud database
- Collections:
  - Users
  - Groups
  - Messages

---

## Technology Stack

- Node.js
- Express.js
- Socket.IO
- MongoDB Atlas + Mongoose
- JWT Authentication
- Bcrypt for password hashing
- MVC Folder Architecture

---

## Folder Structure (MVC)

