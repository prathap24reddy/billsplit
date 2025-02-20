import React, { useState } from "react";
export const AddFriend = ({onAddMember}) => {
  
  const [newMem, setNewMem]=useState("");

  function handleAddMem(newMem){
      onAddMember(newMem);
      setNewMem("");
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Enter a username to add."
        className="input-i1"
        value={newMem}
        onChange={(e)=>{setNewMem(e.target.value)}}
      />
      <button className="plus-button" onClick={()=>{handleAddMem(newMem)}}>Done</button>
    </div>
  );
};
