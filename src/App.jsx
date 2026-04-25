import "./App.css";
import React,{useState,useEffect} from 'react';
import "leaflet/dist/leaflet.css";
import Heading from './components/Heading';
import Login from "./components/Login";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
const App = () => {
  const[user,setUser] = useState(null);
  const [location, setLocation] = useState(null);
  const[type,setType] = useState("");
  const [places ,setPlaces] = useState([]);
  const[loading,setLoading] =useState(false);
  const[error,setError] = useState("");
  const [search ,setSearch] = useState("");
  const [emergencyMode , setEmergencyMode] = useState(false);
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.log("Error:", error.message);
      }
    );
  };
  const getEmergencyNumber = () => {
    if(type ==="hospital")return "102";
    if(type ==="police") return "100";
    if(type=== "fire") return "101";
  };
  const getDistance = (lat1 ,lon1 , lat2 ,lon2) => {
    const R = 6371 ;
    const dLat =(lat2 -lat1) * Math.PI /180 ;
    const dLon = (lon2 -lon1) * Math.PI /180 ;
    const a = 
    Math.sin(dLat/2)* Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI /180)*
    Math.cos(lat2 * Math.PI /180)*
    Math.sin(dLon/2)* Math.sin(dLon/2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(2);
  };
  useEffect(() => {
    console.log("updated location:",location);
     if(location && type) {
      fetchNearbyPlaces();
    }
  },[location,type]); 
   
  useEffect(() => {
    if(emergencyMode &&location && type ==="hospital" && places.length >0){
      handleEmergencyClick();
    }
  },[places]);
  useEffect(() =>
  {
    console.log("Emergency Mode:" ,emergencyMode);
  }, [emergencyMode]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if(savedUser){
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const fetchNearbyPlaces = async() =>
 {
  if(!location) return;
  setLoading(true);
  setError("");
  let amenityType = "";
  if ( type === "hospital") amenityType ="hospital";
   if ( type === "police") amenityType ="police";
    if ( type === "fire") amenityType ="fire_station";

   const query = `
  [out:json] [timeout:25];
  (
  node["amenity"="${amenityType}"](around:50000,${location.lat},${location.lng});
  );
  out body;
  `;
  try{
      const response = await fetch("https://overpass-api.de/api/interpreter",
     {
    method :"POST",
    body : query
   });
    if (!response.ok) {
  throw new Error("API failed");
}

const data = await response.json();
console.log("API:" , data);
setPlaces(data.elements || []);
} catch (err) {
    console.error("Error:", err);
    setError("Failed to fetch data");
  } finally {
    setLoading(false);
  }
};
  
const nearestPlace =
  places.length > 0
    ? places.reduce((prev, curr) => {
        const prevDist = getDistance(location.lat, location.lng, prev.lat, prev.lon);
        const currDist = getDistance(location.lat, location.lng, curr.lat, curr.lon);
        return prevDist < currDist ? prev : curr;
      })
    : null;
     const filteredPlaces = search?
      places.filter((place) => {
    const name = place.tags?.name?.toLowerCase() || "";
  return name.includes(search.toLowerCase().trim());
  }) :places;
    const sortedPlaces = location ?
    [...filteredPlaces].sort((a,b) => {
    const distA = parseFloat(getDistance(location.lat ,location.lng ,a.lat ,a.lon));
    const distB = parseFloat(getDistance(location.lat , location.lng ,b.lat,b.lon));
    return distA - distB;
  })
  : [];
  const userIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
    iconSize:[30,30],
  });
  const hospitalIcon = new L.Icon({
    iconUrl : "https://cdn-icons-png.flaticon.com/512/2967/2967350.png",
    iconSize : [30,30],
  });
  const policeIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/484/484167.png"
  });
  const foreIcon = new L.Icon({
    iconUrl : "https://cdn-icons-png.flaticon.com/512/482/482132.png",
    iconSize : [30,30],
  });

  const handleEmergencyClick = () => {
    if(!location) {
      alert("Location not available");
      return;
    }
    if(!nearestPlace){
      alert("No hospital found nearby");
      return;
    }
     const url = `https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${nearestPlace.lat},${nearestPlace.lon}`;
      window.open(url, "_blank");
  };
  return (
    <>
      <div>
    {!user ? (
      <Login onLogin={setUser} />
    ) : (
    <div className='container'>
     <button 
  style={{
  position: "absolute",
  top: "20px",
  right: "20px",
  background: "red",
  color: "white",
  border: "none",
  padding: "8px 15px",
  borderRadius: "5px",
  cursor: "pointer"
}}
onClick={() => {
  localStorage.removeItem("user");
  setUser(null);
}}>
  Logout
</button>
      <Heading />
          <button style={{
          background: "red", 
          color: "white", 
          marginTop: "10px",
         padding : "10px 20px",
         border: "none",
         borderRadius: "5px",
         marginBottom: "10px",
         cursor: "pointer"
       }} 
   onClick={() =>{
    setEmergencyMode(true);
  getLocation();
  setType("hospital");
  }}>
  🚨 Emergency Help
</button>

          
      <button className ="button" onClick={() => {
        setEmergencyMode(false);
        getLocation();
       setType("hospital");
       console.log("Location:",location);
      }}>
        Ambulance
      </button>

      <button className='button' onClick={() => {
        setEmergencyMode(false);
        getLocation();
       setType("police");
       console.log("Location:",location);
      }}>
        Police
      </button>

      <button className='button' onClick={() => {
        setEmergencyMode(false);
        getLocation();
        setType("fire");
        console.log("Location:",location);
      }}>
        Fire
      </button>
      {loading && places.length === 0 && !emergencyMode && 
      <p>🔍 Finding nearby help...</p>}
   
      {!loading && error && (
        <div>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={fetchNearbyPlaces}>🔄Retry</button>
        </div> 
      )}
  
      <input type="text" placeholder="search place..." value={search} 
      onChange={(e) => setSearch(e.target.value)}
       style={{ marginTop: "10px", padding: "8px", width: "80%" }}
          />
     {location && places.length > 0 && !emergencyMode && (
  <MapContainer
    center={[location.lat, location.lng]}
    zoom={15}
    style={{ height: "400px", width: "100%", marginTop: "20px" }}>
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
    <Marker position={[location.lat, location.lng]} icon={userIcon}>
      <Popup>You are here</Popup>
    </Marker>
    {sortedPlaces.map((place, index) => (
      <Marker key={index} position={[place.lat, place.lon]}
      icon={
      type === "hospital" ? hospitalIcon :
      type === "police" ? policeIcon :
      type === "fire" ? foreIcon : null
      }>
        <Popup>{place.tags?.name || "Unnamed Place"}</Popup>
      </Marker>
    ))}
  </MapContainer>
)}
      {!loading && !error && places.length === 0 && type &&(
        <p>No nearby {type} found</p>
      )}
      {!loading && places.length > 0 && !emergencyMode && (
         <div>
        
        <h2>Nearby Results</h2>
        {sortedPlaces.map((place,index) =>(
          <div className='card'
          
          style={{border: place === nearestPlace ? "2px solid green" : ""}}
           key={index}>
            {place === nearestPlace && <p>⭐ Nearest</p>}
          <a href={`tel:${getEmergencyNumber()}`}>
            📞Call ({getEmergencyNumber()})</a>
            <p>
              📏{getDistance(location.lat , location.lng ,
                 place.lat , place.lon)} km away
            </p>
            <p><b>{place.tags?.name || 'Unnamed Place'}</b></p>
           <p>📍 Latitude: {place.lat}</p>
           <p>📍 Longitude: {place.lon}</p>
           {place.lat && place.lon &&(
          <a 
          href ={`https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${place.lat},${place.lon}`}
          target ="_blank"
          rel="noopener noreferrer" >
              🚗Get Direction
          </a>
           )}
          </div>                                                                                                                                                                                                                          
        ))}
      </div>
     )}
    
    </div>
    )}
    </div>
    </>
  );
}
export default App;