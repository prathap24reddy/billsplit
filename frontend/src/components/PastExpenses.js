import React, { useState, useRef, useCallback, useContext } from "react";
import { Context } from "../contexts";

export const PastExpenses = () => {
  const { expenseHistory } = useContext(Context);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const listRef = useRef(null); // Reference to the scrollable container

  // Callback ref to handle individual items
  const handleItemRef = useCallback((node, index) => {
    if (node && selectedExpense === expenseHistory[index]) {
      node.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [selectedExpense, expenseHistory]);

  function handleExpandExpense(entry, index) {
    setSelectedExpense(selectedExpense === entry ? null : entry);
  }

  return (
    <div className="past-expenses-container">
      <div className="scrollable-expense-list" ref={listRef}>
        <ul className="expense-list ">
          {expenseHistory.map((entry, index) => {
            const paidBy = entry.users?.filter(user => user.lent > 0) || [];
            const splitTo = entry.users?.filter(user => user.borrow > 0) || [];

            return (
              <li key={index} className="expense-item li1">
                {selectedExpense !== entry && (
                  <button
                    onClick={() => handleExpandExpense(entry, index)}
                    className={`expense-button ${
                      selectedExpense === entry ? "active" : ""
                    }`}
                  >
                    {entry.note}
                  </button>
                )}
                {selectedExpense === entry && (
                  <div className="expense-details">
                    <h3>{entry.note}</h3>
                    {paidBy.length > 0 && (
                      <div>
                        <p><strong>Paid by:</strong></p>
                        {paidBy.map((payer, i) => (
                          <p key={i}>
                            <strong>{payer.name}</strong> paid ${payer.lent}.
                          </p>
                        ))}
                      </div>
                    )}
                    {splitTo.length > 0 && (
                      <p>
                        <strong>Split to:</strong>{" "}
                        {splitTo.map((receiver, i) => (
                          <span key={i}>
                            <strong>{receiver.name}</strong> (${receiver.borrow})
                            {i !== splitTo.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </p>
                    )}
                    <button
                      onClick={() => setSelectedExpense(null)}
                      className="close-button"
                    >
                      Done
                    </button>
                  </div>
                )}
                <div ref={(node) => handleItemRef(node, index)} />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
