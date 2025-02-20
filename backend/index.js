import express from "express";
import db from "./connection.js";
import cors from "cors";
import jwt from "jsonwebtoken";

import {
  handleGetTrips,
  handleCreateNewTrip,
  handlePostTripUsers,
  handleGetTripUsers,
  handleCreateTransactions,
  handleGetTransactions,
  handleDeleteTransaction,
  handleUpdateTransaction,
  handleSignup,
  handleLogin,
  handleAddUser,
} from "./controllers/index.js";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

db.connect();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Extract token

  if (!token)
    return res.status(401).json({ message: "Unauthorized: No token provided" });

  jwt.verify(token, "secret", (err, user) => {
    if (err)
      return res.status(403).json({ message: "Forbidden: Invalid token" });

    req.user = user; // Store user info in request
    next(); // Proceed to next middleware
  });
}

async function authorizeTripAccess(req, res, next) {
  const { tripId } = req.params;
  const userId = req.user?.id; // Extract user ID from authenticated request

  if (!tripId || !userId) {
    return res.status(400).json({ error: "Trip ID and user ID are required." });
  }

  try {
    // Check if the user is associated with the trip in the trip_users table
    const { rows } = await db.query(
      `SELECT 1 FROM trip_users WHERE trip_id = $1 AND user_id = $2 LIMIT 1`,
      [tripId, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        error:
          "Unauthorized: You do not have access to this trip's transactions.",
      });
    }

    next(); // User is authorized, proceed to the next middleware/controller
  } catch (error) {
    console.error("Authorization check error:", error);
    res
      .status(500)
      .json({ error: "Internal server error while checking authorization." });
  }
}

app.route("/login/").post(handleLogin);

app.route("/signup").post(handleSignup);

app
  .route("/trips/")
  .get(authenticateToken, handleGetTrips)
  .post(authenticateToken, handleCreateNewTrip);

app
  .route("/trips/:tripId/users")
  .get(authenticateToken, authorizeTripAccess, handleGetTripUsers)
  .post(authenticateToken, authorizeTripAccess, handleAddUser);

app
  .route("/trips/:tripId/transactions")
  .get(authenticateToken, authorizeTripAccess, handleGetTransactions)
  .post(authenticateToken, authorizeTripAccess, handleCreateTransactions);

// app
//   .route("transactions/:transactionId")
//   .delete(handleDeleteTransaction)
//   .put(handleUpdateTransaction);

app.listen(PORT, () => console.log(`Server running on port: ${PORT}.`));
