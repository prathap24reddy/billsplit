import React, { useContext, useState, useEffect } from "react";
import { Context } from "../contexts";

export const Settlements = () => {
  const { tripMembers, expenseHistory } = useContext(Context);
  const [settlements, setSettlements] = useState([]);

  useEffect(() => {
    calculateSettlements();
  }, [expenseHistory]);

  function calculateSettlements() {
    let balances = new Map();

    // Initialize balances
    tripMembers.forEach((member) => {
      balances.set(member.id, 0);
    });

    // Calculate balances using the new transaction format
    expenseHistory.forEach((expense) => {
      expense.users.forEach((user) => {
        // Add amount to those who lent
        if (user.lent > 0) {
          balances.set(user.id, (balances.get(user.id) || 0) + user.lent);
        }
        // Subtract amount from those who borrowed
        if (user.borrow > 0) {
          balances.set(user.id, (balances.get(user.id) || 0) - user.borrow);
        }
      });
    });

    let getsBack = [];
    let paysBack = [];
    let transactions = [];

    balances.forEach((amount, id) => {
      if (Math.abs(amount) < 1.0) {
        // Mark settled transactions for amounts less than ₹1
        let name = tripMembers.find((m) => m.id === id)?.name || "Unknown";
        transactions.push({
          from: name,
          to: "No one",
          amount: "0.00",
          settled: true,
        });
      } else if (amount < 0) {
        paysBack.push({ id, amount: Math.abs(amount) });
      } else if (amount > 0) {
        getsBack.push({ id, amount });
      }
    });

    // Sort creditors and debtors
    getsBack.sort((a, b) => b.amount - a.amount);
    paysBack.sort((a, b) => b.amount - a.amount);

    const threshold = 0.10; // Consider amounts ≤ ₹0.10 as settled

    while (getsBack.length > 0 && paysBack.length > 0) {
      let creditor = getsBack[0];
      let debtor = paysBack[0];

      if (creditor.amount <= threshold) {
        getsBack.shift();
        continue;
      }

      let settleAmount = Math.min(creditor.amount, debtor.amount);
      let creditorName = tripMembers.find((m) => m.id === creditor.id)?.name || "Unknown";
      let debtorName = tripMembers.find((m) => m.id === debtor.id)?.name || "Unknown";

      transactions.push({
        from: debtorName,
        to: creditorName,
        amount: settleAmount.toFixed(2),
        settled: settleAmount < 1.0, // Mark settled if less than ₹1
      });

      creditor.amount -= settleAmount;
      debtor.amount -= settleAmount;

      if (creditor.amount <= threshold) getsBack.shift();
      if (debtor.amount <= threshold) paysBack.shift();
    }

    setSettlements(transactions);
  }

  return (
    <div className="settlements">
      <h3>Settlements</h3>
      {settlements.length === 0 ? (
        <p>All expenses are settled!</p>
      ) : (
        <ul>
          {settlements.map((settlement, index) => (
            <li key={index}>
              {settlement.from} pays ₹{settlement.amount} to {settlement.to}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
