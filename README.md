# BillSplit - Expense Management System

## Overview
BillSplit is an expense management system designed to simplify group expense tracking and splitting. Users can log expenses, assign payers and split amounts among participants efficiently.

## Features
- **User Authentication**: Secure login and signup system.
- **Trip Management**: Create and manage trips for tracking expenses.
- **Expense Tracking**: Log expenses, specify who paid, and split among members.
- **Split Options**: Equally or custom-defined split for each expense.
- **Expense History**: View and manage past transactions.
- **Persistent Storage**: Data stored securely using PostgreSQL.
- **Transaction Optimization**: Algorithm to minimize transactions to settle balances efficiently.

## Technologies Used
- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication

## Installation & Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/billsplit.git
   ```
2. Navigate to the project directory:
   ```sh
   cd billsplit
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Set up environment variables in a `.env` file:
   ```env
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret
   ```
5. Run the server:
   ```sh
   npm start
   ```
6. Open the frontend:
   ```sh
   cd client
   npm start
   ```

## Usage
1. Register or log in.
2. Create a trip and add members.
3. Add expenses, assign payers, and split among participants.
4. View and manage expenses in the trip history.

## Contribution
Contributions are welcome! Feel free to fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.

