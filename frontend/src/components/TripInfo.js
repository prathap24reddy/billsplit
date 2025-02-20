import React, { useContext, useEffect, useState } from "react";
import { AddFriend } from "./AddFriend";
import { AddExpense } from "./AddExpense";
import { SummarizeTrip } from "./SummarizeTrip";
import { PastExpenses } from "./PastExpenses";
import { Settlements } from "./Settlements";
import axios from "axios";
import { Context } from "../contexts";

export default function TripInfo() {
  const {
    api,
    token,
    tripMembers,
    setTripMembers,
    tripInfo,
    expenseHistory,
    setExpenseHistory,
  } = useContext(Context);

  const [activeModal, setActiveModal] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  async function fetchUsers() {
    if (!tripInfo?.id) {
      return;
    }
    try {
      const response = await axios.get(`${api}/trips/${tripInfo.id}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Update the context with the fetched users
      setTripMembers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
    }
  }

  async function fetchTransactions() {
    if (!tripInfo?.id) {
      return;
    }
    try {
      const response = await axios.get(`${api}/trips/${tripInfo.id}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setExpenseHistory(response.data);
    } catch (error) {
      console.error(
        "Error fetching transactions:",
        error.response?.data || error.message
      );
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
  }, [tripInfo]);

  const addNewMember = async (newName) => {
    setActiveModal(false);
    if (newName.trim() === "") return; // Prevent adding empty names
    try {
      // Send request to backend to add the user to the trip
      const response = await axios.post(
        `${api}/trips/${tripInfo.id}/users`,
        { username: newName },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      // Extract new user details from response
      const newUser = response.data.user;
  
      // Update the frontend state with the new member
      setTripMembers([...tripMembers, { id: newUser.id, name: newUser.name }]);
  
      // Close the modal
    } catch (error) {
      console.error("Error adding new member:", error.response?.data || error.message);
  
      // Show an error message (Optional: Use state to display error)
      alert(error.response?.data?.error || "Failed to add member. Try again.");
    }
  };

  const addExpense = () => {
    setActiveModal(false);
  };

  // Function to open modal with a specific component
  const openModal = (modalId) => {
    setActiveModal(modalId);
  };

  // Function to render the correct modal component
  const renderModalContent = () => {
    switch (activeModal) {
      case "addFriend":
        return <AddFriend onAddMember={addNewMember} />;
      case "addExpense":
        return <AddExpense onAddExpense={addExpense} />;
      default:
        return null;
    }
  };

  return (
    <div className="trip-info item2">
      {showSummary ? (
        <SummarizeTrip onDone={() => setShowSummary(false)} />
      ) : (
        <div>
          <header className="header-h2">
            {(tripInfo && tripInfo.name) || "Dashboard"}
          </header>

          {!tripInfo ? (
            <p>Create or Select a Trip</p>
          ) : (
            <div className={`content-area ${activeModal ? "blurred" : ""}`}>
              <div className="button-b2">
                <button onClick={() => openModal("addFriend")}>
                  Add Friend
                </button>
                <button onClick={() => openModal("addExpense")}>
                  Add Expense
                </button>
                <button onClick={() => setShowSummary(true)}>
                  Summarize Expenses with AI
                </button>
              </div>

              {/* Conditionally render Settlements or SummarizeTrip */}
              <Settlements />
              <div>
                <header className="header-h2">Past Expenses</header>
                <PastExpenses />
              </div>
            </div>
          )}

          {/* Modal (renders component based on activeModal state) */}
          {activeModal && (
            <div className="modal-overlay">
              <div className="modal">{renderModalContent()}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
