  import "./App.css";
import React,{useState,useEffect} from 'react';
import Heading from './components/Heading';
const App = () => {
  const [location, setLocation] = useState(null);
  const[type,setType] = useState("");
  const [places ,setPlaces] = useState([]);
  const[loading,setLoading] =useState(false);
  const[error,setError] = useState("");
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
  node["amenity"="${amenityType}"](around:30000,${location.lat},${location.lng});
  );
  out body;
  `;
  try{
      const response = await fetch("https://overpass.kumi.systems/api/interpreter",
     {
    method :"POST",
    body : query
   }
   );
   const data = await response.json();
    console.log("API Data:", data);
   setPlaces(data.elements || []);
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    setError("Failed to fetch nearby places. Please try again.");
  }
  setLoading(false);
};
const nearestPlace =
  places.length > 0
    ? places.reduce((prev, curr) => {
        const prevDist = getDistance(location.lat, location.lng, prev.lat, prev.lon);
        const currDist = getDistance(location.lat, location.lng, curr.lat, curr.lon);
        return prevDist < currDist ? prev : curr;
      })
    : null;

  return (
    <div className='container'>
      <Heading />
      <button className ="button" onClick={() => {
        getLocation();
       setType("hospital");
       console.log("Location:",location);
      }}>
        Ambulance
      </button>

      <button className='button' onClick={() => {
        getLocation();
       setType("police");
       console.log("Location:",location);
      }}>
        Police
      </button>

      <button className='button' onClick={() => {
        getLocation();
        setType("fire");
        console.log("Location:",location);
      }}>
        Fire
      </button>
      {loading && places.length === 0 && 
      <p>🔍 Finding nearby help...</p>}
      {!loading && error && (
        <div>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={fetchNearbyPlaces}>🔄Retry</button>
        </div>
      )}
      {!loading && !error && places.length === 0 && type &&(
        <p>No nearby {type} found</p>
      )}
      {!loading && places.length > 0 && (
         <div>
        
        <h2>Nearby Results</h2>
        {places.map((place,index) =>(
          <div className='card'
          
          style={{border: place === nearestPlace ? "2px solid green" : ""}}
           key={index}>
            {place === nearestPlace && <p>⭐ Nearest</p>}
          <a href={`tel:${getEmergencyNumber()}`}>
            📞Call ({getEmergencyNumber()})</a>
            <p>
              📏{getDistance(location.lat , location.lng , place.lat , place.lon)} km away
            </p>
            <p><b>{place.tags?.name || 'Unnamed Place'}</b></p>
           <p>📍 Latitude: {place.lat}</p>
           <p>📍 Longitude: {place.lon}</p>
           <a
            href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
             target="_blank"
              rel="noopener noreferrer">
               📍 Open in Map
                <iframe
                width="100%"
                 height="200"
                  style={{ border: 0, marginTop: "10px" }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://maps.google.com/maps?q=${place.lat},${place.lon}&z=15&output=embed`}
                ></iframe>
                 
           </a>
          </div>                                                                                                                                                                                                                          
        ))}
      </div>
     )}
    </div>
  );
};
export default App;