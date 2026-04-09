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
  [out:json];
  (
  node["amenity"="${amenityType}"](around:50000,${location.lat},${location.lng});
  );
  out center;
  `;
  try{
      const response = await fetch("https://overpass-api.de/api/interpreter",
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
            <p><b>{place.tags?.name || 'Unnamed Place'}</b></p>
            <p>Latitude :{place.lat}</p>
             <p>Longitude :{place.lon}</p>
          </div>
        ))}
      </div>
     )}
    </div>
    
  );
};
export default App;