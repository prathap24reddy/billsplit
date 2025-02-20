import { useState, useContext, useEffect } from "react";
import TripInfo from "./TripInfo";
import {Context} from '../contexts';
import axios from "axios";

export default function Trip() {
  const [expandedTripId, setExpandedTripId] = useState(null);
  const [newPlace, setNewPlace] = useState("");

  const {api, token, trips, setTrips, setTripInfo}=useContext(Context);

  const fetchTrips = async () => {
    try {
      const endpoint=`${api}/trips`;
      const response = await axios.get(endpoint,{
        headers:{
          "Authorization":`Bearer ${token}`
        }
      });
      // console.log(response.data);
      setTrips(response.data);
    } catch (error) {
      console.error("Error fetching trips:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchTrips(); // Call the async function
  }, []);

  function handleExpandTrip(_tripInfo) {
    if ( expandedTripId === _tripInfo.id) {
      setExpandedTripId(null);
      setTripInfo(null);
    } else {
      setExpandedTripId(_tripInfo.id);
      // console.log(_tripInfo);
      setTripInfo(_tripInfo);
    }
  }

  async function handleAddTrip() {
  
    if (newPlace !== "") {
      try {
        const newTripData = {
          name: newPlace,
        };
  
        // Send POST request to backend
        const response = await axios.post(`${api}/trips`, newTripData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
  
        // Assuming the API returns the created trip
        const newTrip = response.data.trip;
        // console.log(newTrip);
  
        setTrips((prevTrips) => [...prevTrips, newTrip]);
        setNewPlace("");
        setExpandedTripId(newTrip.id);
        setTripInfo(newTrip);
      } catch (error) {
        console.error("Error adding trip:", error.response?.data || error.message);
      }
    }
  }
  

  return (
    <div className="box-b1">
      <div className="trips item1">
        <header className="header-h2">Trips</header>
        <ul className="ul1">
          {trips.map((trip) => {
            return (
              <li key={trip.id} className="li1">
                <button
                  className="button-b1"
                  onClick={() => handleExpandTrip(trip)}
                >
                  <p>
                     <strong> {trip.name + "  "}</strong>
                    <span>{trip.start_date || ""}</span>
                  </p>

                  <p>{expandedTripId === trip.id ? "-" : "+"}</p>
                </button>
              </li>
            );
          })}
          <li
            className="li1"
            style={{ display: "flex", alignItems: "baseline" }}
          >
            <input
              type="text"
              placeholder="Enter a Place."
              value={newPlace}
              onChange={(e) => {
                setNewPlace(e.target.value);
              }}
              className="input-i1"
            />
            <div>
              <button className="plus-button" onClick={() => handleAddTrip()}>
                Add
              </button>
            </div>
          </li>
        </ul>
      </div>
      <TripInfo/>
    </div>
  );
}
