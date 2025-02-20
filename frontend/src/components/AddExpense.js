import React, { useContext, useState } from "react";
import axios from "axios";
import { Split } from "./Split";
import { Context } from "../contexts";

export const AddExpense = ({ onAddExpense }) => {
  const {
    tripMembers,
    expenseHistory,
    setExpenseHistory,
    tripInfo,
    api,
    token,
  } = useContext(Context);

  const [note, setNote] = useState("");
  const [splitType, setSplitType] = useState(null);
  const [splitData, setSplitData] = useState([]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [splitAmount, setSplitAmount] = useState(0);
  const [splitEqually, setSplitEqually] = useState(false);

  const [newExpense, setNewExpense] = useState({
    users: tripMembers.map((member) => ({
      id: member.id,
      name: member.name,
      lent: 0,
      borrow: 0,
    })),
    note: "",
  });

  function handleSplitButtonClick(type) {
    setSplitType(type);

    const formattedData = newExpense.users.map((user) => ({
      id: user.id,
      name: user.name,
      amount: type === "SplitTo" ? user.borrow : user.lent, // Use borrow for SplitTo, lent for PaidBy
    }));

    setSplitData(formattedData);
  }

  function handleDone() {
    if (splitType) {
      setNewExpense((prev) => ({
        ...prev,
        users: prev.users.map((user) => {
          const matchingEntry = splitData.find((entry) => entry.id === user.id);
          if (!matchingEntry) return user; // Keep unchanged if user not found

          return {
            ...user,
            lent: splitType === "PaidBy" ? matchingEntry.amount : user.lent, // Set lent if PaidBy
            borrow:
              splitType === "SplitTo" ? matchingEntry.amount : user.borrow, // Set borrow if SplitTo
          };
        }),
      }));

      setSplitType(null);
    } else {
      // console.log("heyyy");
      if (note.trim() === "") {
        alert("Enter a Description to Add the Expense.");
        return;
      }

      if (paidAmount === 0 && splitAmount === 0) {
        alert("Enter some amounts to Add the Expense.");
        return;
      }

      // Validate if total paid amount matches total split amount
      if (paidAmount !== splitAmount) {
        alert("Total amount paid must match total amount split.");
        return;
      }

      // Prepare expense object for backend
      const formattedExpense = {
        amount: paidAmount,
        note: note,
        date: new Date().toISOString().split("T")[0], // Store only the date
        users: newExpense.users.filter(
          (member) => member.lent > 0 || member.borrow > 0
        ),
      };

      // Send to backend
      axios
        .post(`${api}/trips/${tripInfo.id}/transactions`, formattedExpense, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          console.log("Expense added successfully:", response.data);
          setExpenseHistory([...expenseHistory, formattedExpense]); // Update local state
          onAddExpense();
          resetForm();
        })
        .catch((error) => {
          console.error(
            "Error adding expense:",
            error.response?.data || error.message
          );
        });
    }
  }

  function handleCancel() {
    onAddExpense();
  }

  function handleNoteChange(_note) {
    setNote(_note);
    setNewExpense((prev) => ({ ...prev, note: _note }));
  }

  function resetForm() {
    setNewExpense({
      users: tripMembers.map((member) => ({
        id: member.id,
        lent: 0,
        borrow: 0,
      })),
      note: "",
    });
    setNote("");
    setSplitType(null);
    setSplitData([]);
    setPaidAmount(0);
    setSplitAmount(0);
  }

  return (
    <div className="add-expense">
      <div style={{ textAlign: "start" }}>
        <input
          type="text"
          placeholder="Enter a Description."
          className="expense-note"
          onChange={(e) => handleNoteChange(e.target.value)}
          value={note}
        />
        <p style={{ textAlign: "center" }}>
          Paid Amount: ₹{paidAmount} | Split Amount: ₹{splitAmount}
        </p>
      </div>
      <div>
        {!splitType ? (
          <div>
            <div
              className="split-buttons"
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: "20px",
              }}
            >
              <div>
                Paid by:{" "}
                <button onClick={() => handleSplitButtonClick("PaidBy")}>
                  Select
                </button>
              </div>
              <div>
                Split to:{" "}
                <button onClick={() => handleSplitButtonClick("SplitTo")}>
                  Select
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Split
            type={splitType}
            grpMembers={tripMembers}
            splitData={splitData}
            setSplitData={setSplitData}
            handleDone={handleDone}
            paidAmount={paidAmount}
            splitAmount={splitAmount}
            setPaidAmount={setPaidAmount}
            setSplitAmount={setSplitAmount}
            splitEqually={splitEqually}
            setSplitEqually={setSplitEqually}
          />
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            marginTop: "20px",
          }}
        >
          <button onClick={handleCancel}>Cancel</button>
          <button onClick={handleDone}>Done</button>
        </div>
      </div>
    </div>
  );
};
