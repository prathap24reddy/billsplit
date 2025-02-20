import Header from "./components/Header";
import Trips from "./components/Trips";
import LoginSignup from "./Login";

import { Context } from "./contexts";
import { useContext } from "react";

function App() {
  const { token, setToken } = useContext(Context);

  const handleAuthSuccess = (newToken) => {
    setToken(newToken);
  };
  
  return (
    <div className="App">
      <Header />
        {token ? <Trips /> : <LoginSignup onAuthSuccess={handleAuthSuccess} />}
      {/* <Footer /> */}
    </div>
  );
}

export default App;
