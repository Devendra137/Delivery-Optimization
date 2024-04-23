import React, { useState } from "react";
import "./Map.css";
import L from "leaflet";

function SendData({ userLocations, depotLocations, onSuccess, map, L }) {
  const [outputText, setOutputText] = useState("");
  const [numVehicles, setNumVehicles] = useState("");
  const [vehicleCapacities, setVehicleCapacities] = useState("");

  const handleSubmit = async () => {
    // Check if number of vehicles and vehicle capacities are provided
    if (!numVehicles || !vehicleCapacities) {
      alert("Please enter number of vehicles and their capacities.");
      return;
    }

    // Convert vehicle capacities string to array
    const capacitiesArray = vehicleCapacities
      .split(",")
      .map((capacity) => parseInt(capacity.trim()));

    // Check if total capacity is sufficient
    const totalCapacity = capacitiesArray.reduce((acc, curr) => acc + curr, 0);
    if (totalCapacity < userLocations.length) {
      alert("Total capacity of vehicles is insufficient.");
      return;
    }

    // Prepare data object
    const data = {
      userLocations: userLocations,
      depotLocations: depotLocations,
      NoOfVehicles: parseInt(numVehicles),
      vehicleCapacities: capacitiesArray,
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/process_json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      setOutputText(JSON.stringify(responseData));
      if (onSuccess) {
        onSuccess(responseData);
      }
    } catch (error) {
      console.error("Error:", error);
    }

    if (map && map.legend) {
      map.legend.remove();
    }

    const colors = ["blue", "red", "green", "orange", "purple", "yellow"];
    const colorMapping = {};
    for (let i = 0; i < parseInt(numVehicles); i++) {
      colorMapping[`Vehicle ${i + 1}`] = colors[i % colors.length];
    }

    // Display color mapping on the map
    const legend = L.control({ position: "topright" });
    legend.onAdd = function (map) {
      const div = L.DomUtil.create("div", "legend");
      div.innerHTML = "<h4>Vehicle Color Mapping</h4>";
      for (const vehicle in colorMapping) {
        const color = colorMapping[vehicle];
        div.innerHTML += `<span style="color: ${color}">${vehicle}</span><br>`;
      }
      return div;
    };
    legend.addTo(map);
    map.legend = legend;
  };

  return (
    <div>
      <div className="input-container">
        <label>Number of Vehicles:</label>
        <input
          type="number"
          value={numVehicles}
          onChange={(e) => setNumVehicles(e.target.value)}
        />
      </div>
      <div className="input-container">
        <label>Vehicle Capacities (comma separated):</label>
        <input
          type="text"
          value={vehicleCapacities}
          onChange={(e) => setVehicleCapacities(e.target.value)}
        />
      </div>
      <button className="submit-button" onClick={handleSubmit}>
        Submit
      </button>

      <div>
        <h3>Output:</h3>
        <p>{outputText}</p>
      </div>
    </div>
  );
}

export { SendData };
