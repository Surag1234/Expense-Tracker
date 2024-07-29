**Expense Tracker App**


**Overview**

The Expense Tracker App is a web-based application designed to help users manage and split expenses among friends or group members. The app provides functionalities for creating groups, adding expenses, viewing balance sheets, and calculating settlements.

**Features**

**User Authentication**: Users can sign up and log in securely using JWT tokens.
**Group Management**: Create and manage groups of users.
**Expense Management**: Add and track expenses within groups.
**Balance Sheet Calculation**: View the balance of each group member.
**Settlement Calculation**: Calculate settlements to resolve debts among group members.
**API Routes**: A RESTful API backend using Express and MongoDB.

**Technologies Used**

**Frontend:** HTML, CSS, JavaScript
**Backend**: Node.js, Express
**Database**: MongoDB
**Authentication**: JWT (JSON Web Tokens)
**Other**: Mongoose (MongoDB ODM)

**API Endpoints**

**Authentication**
POST /api/auth/signup: User signup
POST /api/auth/login: User login

**Group Management**
POST /api/groups: Create a new group
GET /api/groups: Get all groups

**Expense Management**
POST /api/expenses: Add a new expense
GET /api/expenses/:groupId: Get expenses for a group

**Balance Sheet**
GET /api/balance/:groupId: Get balance sheet for a group

**Settlement**
GET /api/settlement/:groupId: Get settlement details for a group

**Contributing**
Fork the repository.
Create a new branch (git checkout -b feature-branch).
Make your changes.
Commit your changes (git commit -am 'Add new feature').
Push to the branch (git push origin feature-branch).
Create a new Pull Request.

**To run the app install all files**

**npm install**

**node server.js**

**open localhost 3000**

