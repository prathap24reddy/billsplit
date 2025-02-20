import { createContext, useState } from "react";
import _expenseHistory from "./expenseHistory.json";

const api="http://localhost:4000";

const _trips = [
  {
    id: 1,
    name: "Hyderabad",
    info: "this is in sangareddy district.",
    time: "Mon Feb 10 2025",
  },
  {
    id: 2,
    name: "Nalgonda",
    info: "this is in nalgonda district.",
    time: "Mon Feb 10 2025",
  },
];

const _tripMembers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
  { id: 4, name: "Dave" },
  { id: 5, name: "Emma" },
];

export const Context = createContext(null);

export const ContextProvider = (props) => {
  const [trips, setTrips] = useState([]);
  const [tripMembers, setTripMembers] = useState([]);
  const [tripInfo, setTripInfo] = useState(null);
  const [expenseHistory, setExpenseHistory]=useState([]);

  const [token, setToken]=useState(localStorage.getItem("token"));

  return (
    <Context.Provider
      value={{
        api,
        trips,
        setTrips,
        tripMembers,
        setTripMembers,
        tripInfo,
        setTripInfo,
        expenseHistory, setExpenseHistory,
        // getToken, setToken,
        token, setToken,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};
