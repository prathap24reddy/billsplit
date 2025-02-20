import React, { useContext } from "react";
import { Context } from "../contexts";

const Header = () => {
  const {setToken}=useContext(Context);

  function handleLogout(){
    setToken(null);
    localStorage.removeItem("token");
  }
  return (
    <header className="header-h1"style={{display:"flex", justifyContent:"space-between"}}>BillSplit. <button onClick={()=>{handleLogout()}}>Logout</button></header>

  );
}

export default Header;