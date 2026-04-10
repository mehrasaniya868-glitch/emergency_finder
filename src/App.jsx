  import "./App.css";
import React,{useState,useEffect} from 'react';
import Heading from './components/Heading';
const App = () => {
  const [location, setLocation] = useState(null);
  const[type,setType] = useState("");
  const [places ,setPlaces] = useState([]);
const[loading,setLoading] =useState(false);
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
  }
  setLoading(false);
};

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
      {loading && <p>Loading...</p>}
     {places.length > 0 && (
      <div>
        <h2>Nearby Results</h2>
        {places.map((place,index) =>(
          <div className='card' key={index}>
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
           </a>
          </div>
          
        ))}
      </div>
     )}
    </div>
    
  );
};
export default App;