import React, { useState, useEffect } from "react";

export const Split = ({ 
  type, 
  grpMembers, 
  splitData, 
  setSplitData, 
  paidAmount, 
  setPaidAmount, 
  splitAmount, 
  setSplitAmount, 
  splitEqually, 
  setSplitEqually 
}) => {
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Handles individual amount input
  const handleInputChange = (id, value) => {
    setSplitData((prevData) => {
      const updatedData = prevData.map((entry) =>
        entry.id === id ? { ...entry, amount: value } : entry
      );

      // Compute new total PaidBy or SplitTo amount
      const newTotalAmount = updatedData.reduce((sum, member) => sum + (member.amount || 0), 0);

      // Update the correct total based on type
      if (type === "PaidBy") {
        setPaidAmount(newTotalAmount);
      } else if (type === "SplitTo") {
        setSplitAmount(newTotalAmount);
      }

      return updatedData;
    });
  };

  // Handles checkbox selection for "SplitTo" members
  const handleCheckboxChange = (id) => {
    setSelectedMembers((prevSelected) => {
      const newSelected = prevSelected.includes(id)
        ? prevSelected.filter((memberId) => memberId !== id) // Remove if already selected
        : [...prevSelected, id]; // Add if not selected

      return newSelected;
    });

    // If "Split Equally" is active, recalculate values
    if (splitEqually) {
      distributeEqually(paidAmount, selectedMembers);
    }
  };

  // Handles "Split Equally" functionality
  const handleSplitEqually = () => {
    setSplitEqually((prev) => !prev);
  };

  // Function to distribute amount equally
  const distributeEqually = (amount, members) => {
    if (members.length === 0) return;
    const equalAmount = Math.floor((amount / members.length) * 100) / 100; // Round to 2 decimals

    setSplitData((prevData) =>
      prevData.map((entry) =>
        members.includes(entry.id)
          ? { ...entry, amount: equalAmount, borrow: equalAmount, lent: 0 }
          : { ...entry, amount: 0, borrow: 0, lent: 0 }
      )
    );

    setSplitAmount(amount); // Ensure splitAmount matches paidAmount when splitting equally
  };

  // Effect to divide amounts equally when "Split Equally" is checked
  useEffect(() => {
    if (splitEqually) {
      distributeEqually(paidAmount, selectedMembers);
    }
  }, [splitEqually, selectedMembers, paidAmount]);

  return (
    <div className="split-container">
      <h3 style={{ marginBottom: "0px" }}>{type}</h3>
      <ul className="ul2">
        {grpMembers.map((member) => (
          <li className="li2" key={member.id}>
            <div className="split-item">
              <p>{member.name}</p>
              {type === "SplitTo" && (
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => handleCheckboxChange(member.id)}
                />
              )}
              <div className="split-input">
                <p>₹</p>
                <input
                  type="number"
                  value={splitData.find((entry) => entry.id === member.id)?.amount || ""}
                  onChange={(e) => handleInputChange(member.id, Number(e.target.value))}
                  disabled={type === "SplitTo" && (!selectedMembers.includes(member.id) || splitEqually)} 
                />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* "Split Equally" Checkbox (Only for SplitTo) */}
      {type === "SplitTo" && (
        <div>
          <label>
            <input type="checkbox" checked={splitEqually} onChange={handleSplitEqually} />
            Split Equally
          </label>
        </div>
      )}
    </div>
  );
};
