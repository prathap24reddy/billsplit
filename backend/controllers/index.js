import db from "../connection.js";
import { setUser } from "../auth.js";

async function getTrips(userId){
    const result = await db.query(
      `
            SELECT DISTINCT t.* 
            FROM trips t
            JOIN trip_users tu ON t.id = tu.trip_id
            WHERE tu.user_id = $1
            ORDER BY t.start_date DESC
        `,
      [userId]
    );
  return result.rows;
}

async function handleLogin(req,res) {
  console.log(req.body);
  const {username, password}=req.body;
  try {
    const query = `SELECT id, name, password FROM users WHERE name = $1`;
    const result = await db.query(query, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid username." });
    }

    const user = result.rows[0];

    if(user.password!==password){
      return res.status(401).json({ error: "Invalid password." });
    }

    const token = setUser({ id: user.id, username: user.username });

    res.status(200).json({
      message: "Login successful",
      userId: user.id,
      token: token,
    });
    
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleSignup(req,res) {
  const { username, password, email } = req.body;
  try {
    // Insert new user into the database
    const result = await db.query(
      `INSERT INTO users (name, password, email) 
      VALUES ($1, $2, $3) 
      RETURNING id;`,
      [username, password, email]
    );

    // Generate token
    const token = setUser({ id: result.insertId, username:username });

    res.status(200).json({
      message: "User registered successfully",
      token: token,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

async function handleGetTrips(req, res) {
  const { id } = req.user;
  // console.log("request received", id);
  try {
    const result=await getTrips(id);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user trips:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching user trips" });
  }
}

async function handleCreateNewTrip(req, res) {
  const { name } = req.body;
  const userId = req.user?.id;

  // Validate input
  if (!name || !userId) {
    return res.status(400).json({ error: "Trip name and user ID are required." });
  }

  try {
    // Start a transaction
    await db.query("BEGIN");

    // Insert the new trip and retrieve the inserted trip
    const { rows: tripRows } = await db.query(
      `INSERT INTO trips (name, start_date) 
       VALUES ($1, $2) 
       RETURNING id, name, start_date`,
      [name, new Date().toDateString()]
    );

    const newTrip = tripRows[0];
    console.log(newTrip);

    // Associate the user with the new trip
    await db.query(
      `INSERT INTO trip_users (trip_id, user_id) 
       VALUES ($1, $2)`,
      [newTrip.id, userId]
    );

    // Commit the transaction
    await db.query("COMMIT");

    // Send a success response with the created trip details
    res.status(201).json({
      message: "Trip created successfully",
      trip: newTrip,
    });
  } catch (error) {
    // Rollback the transaction in case of an error
    await db.query("ROLLBACK");

    console.error("Error creating trip:", error);
    res.status(500).json({ error: "Failed to create the trip. Please try again." });
  }
}


async function handlePostTripUsers(req, res) {
  const { tripId, userId } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO trip_users (trip_id, user_id) VALUES ($1, $2) RETURNING *",
      [tripId, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding user to trip:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the user to the trip" });
  }
}

async function handleGetTripUsers(req, res) {
  const { tripId } = req.params;
  try {
    const result = await db.query(
      "SELECT users.id, users.name FROM users JOIN trip_users ON users.id = trip_users.user_id WHERE trip_users.trip_id = $1",
      [tripId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching trip users:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching trip users" });
  }
}

async function handleCreateTransactions(req, res) {
  const { tripId } = req.params;
  const { amount, note, date, users } = req.body;
  console.log(req.body);
  if (!tripId) {
    return res.status(400).json({ error: "Trip ID is required." });
  }

  if (!amount || !note || !date || !users || users.length === 0) {
    return res.status(400).json({ error: "All transaction details are required." });
  }

  try {
    // ✅ Check if trip exists
    const tripCheck = await db.query("SELECT id FROM trips WHERE id = $1", [tripId]);
    if (tripCheck.rowCount === 0) {
      return res.status(404).json({ error: "Trip not found." });
    }

    // ✅ Insert into transactions
    const transactionResult = await db.query(
      `INSERT INTO transactions (trip_id, amount, note, date) 
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [tripId, amount, note, date]
    );

    const transactionId = transactionResult.rows[0].id;

    // ✅ Prepare batch insert for transaction_users
    const values = users
      .map((_, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`)
      .join(", ");

    const flatValues = users.flatMap((user) => [
      transactionId, user.id, user.borrow || 0, user.lent || 0,
    ]);

    if (users.length > 0) {
      const insertQuery = `
        INSERT INTO transaction_users (transaction_id, user_id, borrow, lent)
        VALUES ${values}
      `;

      await db.query(insertQuery, flatValues);
    }

    res.status(201).json({ message: "Transaction added successfully!", transactionId });

  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ error: "Internal server error." });
  }
}




async function handleGetTransactions(req, res) {
  const { tripId } = req.params;
  if (!tripId) {
    return res.status(400).json({ error: "Trip ID is required." });
  }

  try {
    const result = await db.query(
      `
      SELECT 
        t.id, 
        t.amount, 
        t.note, 
        t.date,
        COALESCE(json_agg(
          json_build_object(
            'id', u.id,
            'name', u.name,
            'lent', tu.lent,
            'borrow', tu.borrow
          )
        ) FILTER (WHERE u.id IS NOT NULL), '[]'::json) AS users
      FROM transactions t
      LEFT JOIN transaction_users tu ON t.id = tu.transaction_id
      LEFT JOIN users u ON tu.user_id = u.id
      WHERE t.trip_id = $1
      GROUP BY t.id
      ORDER BY t.date DESC
      `,
      [tripId]
    );

    res.json(result.rows || []); // Ensure response is always an array
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ error: "An error occurred while fetching transactions." });
  }
}


async function handleDeleteTransaction(req, res) {
  const { transactionId } = req.params;
  try {
    await db.query("BEGIN");

    // Delete related transaction_users entries
    await db.query("DELETE FROM transaction_users WHERE transaction_id = $1", [
      transactionId,
    ]);

    // Delete the transaction
    const result = await db.query(
      "DELETE FROM transactions WHERE id = $1 RETURNING *",
      [transactionId]
    );

    await db.query("COMMIT");

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Transaction not found" });
    } else {
      res.json({
        message: "Transaction and related data deleted successfully",
      });
    }
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Error deleting transaction:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the transaction" });
  }
}

async function handleUpdateTransaction(req, res) {
  const { transactionId } = req.params;

  try {
    // Destructure and separate transaction details and user entries
    const [transactionDetails, ...userEntries] = req.body;

    if (!transactionDetails || userEntries.length === 0) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { trip_id, amount, note } = transactionDetails;

    // Start a transaction
    await db.query("BEGIN");

    // Update the `transactions` table
    const transactionResult = await db.query(
      "UPDATE transactions SET trip_id = $1, amount = $2, note = $3 WHERE id = $4 RETURNING *",
      [trip_id, amount, note, transactionId]
    );

    if (transactionResult.rowCount === 0) {
      throw new Error(`Transaction with id ${transactionId} not found`);
    }

    // Delete existing entries in `transaction_users` for the transaction
    await db.query("DELETE FROM transaction_users WHERE transaction_id = $1", [
      transactionId,
    ]);

    // Insert updated user entries into `transaction_users` table
    for (const { user_id, amount } of userEntries) {
      await db.query(
        "INSERT INTO transaction_users (transaction_id, user_id, lent) VALUES ($1, $2, $3)",
        [transactionId, user_id, amount]
      );
    }

    // Commit the transaction
    await db.query("COMMIT");

    res.status(200).json({
      message: "Transaction and user entries updated successfully",
      transaction: transactionResult.rows[0],
    });
  } catch (error) {
    // Rollback the transaction in case of an error
    await db.query("ROLLBACK");
    console.error("Error updating transaction:", error);
    res
      .status(500)
      .json({
        error:
          "An error occurred while updating the transaction and user entries",
      });
  }
}

async function handleAddUser(req, res) {
  const { tripId } = req.params;
  const { username } = req.body;

  if (!tripId) {
    return res.status(400).json({ error: "Trip ID is required." });
  }
  if (!username) {
    return res.status(400).json({ error: "Username is required." });
  }

  try {
    // Check if the user exists
    const userResult = await db.query(
      `SELECT id, name FROM users WHERE name = $1`,
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const userId = userResult.rows[0].id;

    // Check if user is already part of the trip
    const tripUserCheck = await db.query(
      `SELECT * FROM trip_users WHERE trip_id = $1 AND user_id = $2`,
      [tripId, userId]
    );

    if (tripUserCheck.rows.length > 0) {
      return res.status(400).json({ error: "User is already in the trip." });
    }

    // Add the user to trip_users
    await db.query(
      `INSERT INTO trip_users (trip_id, user_id) VALUES ($1, $2)`,
      [tripId, userId]
    );

    // Return the added user data
    res.status(201).json({
      message: "User added to trip successfully.",
      user: { id: userId, name: userResult.rows[0].name },
    });

  } catch (error) {
    console.error("Error adding user to trip:", error);
    res.status(500).json({ error: "An error occurred while adding the user." });
  }
}


export {
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
  handleAddUser
};
