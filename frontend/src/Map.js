import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css"; // Import custom CSS file for styling
import { redIcon, greenIcon, blueDotIcon } from "./Icon.js";
import { SendData } from "./Connectbackend.js";

const Map = () => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [userLocations, setUserLocations] = useState([]);
  const [depotLocations, setDepotLocations] = useState([]);
  const [locationToggle, setLocationToggle] = useState(true); // true -> user, false -> depot
  const [mapReady, setMapReady] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [numVehicles, setNumVehicles] = useState(0);

  useEffect(() => {
    const mapInstance = L.map("map").setView([20.5937, 78.9629], 5);
    setMap(mapInstance);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance);

    setMapReady(true);

    return () => {
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (mapReady && map) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            map.setView([latitude, longitude], 12);

            L.marker([latitude, longitude], { icon: blueDotIcon }).addTo(map);
          },
          (error) => {
            console.error("Error getting user's location:", error);
            // If geolocation is denied or not available, set default view
            map.setView([20.5937, 78.9629], 5); // Default view on India
          }
        );
      } else {
        console.log("Geolocation is not supported by your browser");
        // If geolocation is not supported, set default view
        map.setView([20.5937, 78.9629], 5); // Default view on India
      }
    }
  }, [mapReady, map]);

  useEffect(() => {
    if (!map) return;

    const addLocationfunct = (e) => {
      if (e == null) return;

      const { lat, lng } = e.latlng;
      const newLocations = locationToggle
        ? [...userLocations, e.latlng]
        : [...depotLocations, e.latlng];

      const marker = L.marker([lat, lng], {
        icon: locationToggle ? greenIcon : redIcon,
      }).addTo(map);

      setMarkers([...markers, marker]);

      locationToggle
        ? setUserLocations(newLocations)
        : setDepotLocations(newLocations);
    };

    map.on("click", addLocationfunct);

    return () => {
      map.off("click", addLocationfunct);
    };
  }, [map, locationToggle, userLocations, depotLocations, markers]);

  const handleAddSource = () => {
    setLocationToggle(true);
  };

  const handleAddDestination = () => {
    setLocationToggle(false);
  };
  const handleVehicleSubmit = (num) => {
    setNumVehicles(num);
  };

  const colors = ["blue", "red", "green", "orange", "purple", "yellow"]; // Define array of colors

  const drawRoutes = (routes) => {
    if (map) {
      // Remove existing routes
      map.eachLayer((layer) => {
        if (layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });

      routes.forEach((routeData, index) => {
        const route = routeData[`Route for Vehicle ${index + 1}`];
        console.log(route);
        const latLngs = route.map((coord) => L.latLng(coord[0], coord[1]));
        const color = colors[index % colors.length]; // Use modulo to cycle through colors
        L.polyline(latLngs, { color: color }).addTo(map); // Use the selected color for the polyline
      });
    } else {
      console.error("Map is not initialized yet.");
    }
  };

  return (
    <div>
      <div id="map" style={{ height: "700px" }}></div>
      <button className="button" onClick={handleAddSource}>
        Add Destinations
      </button>
      <button className="button" onClick={handleAddDestination}>
        Add Source
      </button>
      <SendData
        userLocations={userLocations}
        depotLocations={depotLocations}
        onSuccess={drawRoutes}
        numVehicles={numVehicles}
        map={map} // Pass the map instance
        L={L} // Pass the Leaflet object
      />
    </div>
  );
};

export default Map;
