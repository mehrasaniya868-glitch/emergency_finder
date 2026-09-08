import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  AmbulanceIcon,
  PoliceIcon,
  FireIcon,
  PinIcon,
  PhoneIcon,
  RouteIcon,
  SearchIcon,
} from "../components/Icons";
import "./NearbyServices.css";

const categories = [
  { key: "all", label: "All", amenity: null, tone: "red", call: "112" },
  { key: "hospital", label: "Hospitals", amenity: "hospital", icon: AmbulanceIcon, tone: "red", call: "102" },
  { key: "police", label: "Police", amenity: "police", icon: PoliceIcon, tone: "blue", call: "100" },
  { key: "fire", label: "Fire", amenity: "fire_station", icon: FireIcon, tone: "amber", call: "101" },
];

const amenityMeta = {
  hospital: { label: "Hospital", tone: "red", call: "102", Icon: AmbulanceIcon },
  police: { label: "Police", tone: "blue", call: "100", Icon: PoliceIcon },
  fire_station: { label: "Fire Station", tone: "amber", call: "101", Icon: FireIcon },
};

const NearbyServices = () => {

  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState("all");
  const [search, setSearch] = useState("");

const getLocation = () => {
  if (!navigator.geolocation) {
    setError("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) =>
      setLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }),
    () => setError("Unable to access your location. Please enable it."),
    { timeout: 10000 }
  );
};

useEffect(() => {
  getLocation();
}, []);
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
  };

const fetchAll = async () => {
  if (!location) return;

  setLoading(true);
  setError("");

  const services = ["hospital", "police", "fire_station"];

  try {
    const results = await Promise.all(
      services.map(async (type) => {
        const url = `${import.meta.env.VITE_API_URL}/nearby?lat=${location.lat}&lon=${location.lng}&type=${type}`;

        console.log("Fetching nearby:", url);

        const response = await fetch(url);

        console.log(`${type} status:`, response.status);

        if (!response.ok) {
          throw new Error(`${type} request failed`);
        }

        return response.json();
      })
    );

    const allPlaces = results.flatMap(
      (data) => data.elements || []
    );

    console.log("Nearby services:", allPlaces);

    setPlaces(allPlaces);

    if (allPlaces.length === 0) {
      setError("No nearby emergency services found.");
    }
  } catch (err) {
    console.error("Nearby fetch error:", err);
    setPlaces([]);
    setError("Server busy. Please try again.");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (location) fetchAll();
  }, [location]);

  const counts = {
    hospital: places.filter((p) => p.tags?.amenity === "hospital").length,
    police: places.filter((p) => p.tags?.amenity === "police").length,
    fire: places.filter((p) => p.tags?.amenity === "fire_station").length,
  };

  const visible = places
    .filter((p) => {
      if (active === "all") return true;
      const a = categories.find((c) => c.key === active)?.amenity;
      return p.tags?.amenity === a;
    })
    .filter((p) => {
      if (!search) return true;
      return (p.tags?.name || "").toLowerCase().includes(search.toLowerCase());
    })
    .map((p) => ({
      ...p,
      dist: location
        ? parseFloat(getDistance(location.lat, location.lng, p.lat, p.lon))
        : 0,
    }))
    .sort((a, b) => a.dist - b.dist);

  return (
    <div className="nearby">
      <section className="nearby-counts">
        <div className="ncount ncount--red">
          <span className="ncount-icon"><AmbulanceIcon size={22} /></span>
          <div>
            <strong>{counts.hospital}</strong>
            <span>Hospitals</span>
          </div>
        </div>
        <div className="ncount ncount--blue">
          <span className="ncount-icon"><PoliceIcon size={22} /></span>
          <div>
            <strong>{counts.police}</strong>
            <span>Police Stations</span>
          </div>
        </div>
        <div className="ncount ncount--amber">
          <span className="ncount-icon"><FireIcon size={22} /></span>
          <div>
            <strong>{counts.fire}</strong>
            <span>Fire Stations</span>
          </div>
        </div>
      </section>
      <section className="nearby-controls">
        <div className="filter-tabs">
          {categories.map((c) => (
            <button
              key={c.key}
              className={`filter-tab ${active === c.key ? "is-active" : ""}`}
              onClick={() => setActive(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="nearby-search">
          <SearchIcon size={18} />
          <input
            placeholder="Filter by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>
      {loading && (
        <div className="nearby-state">
          <span className="spinner" />
          <h3>Scanning your area...</h3>
          <p>Gathering nearby emergency services within 5 km.</p>
        </div>
      )}

      {!loading && error && (
        <div className="nearby-state nearby-state--error">
          <p>{error}</p>
          {location && <button onClick={fetchAll}>Retry</button>}
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="nearby-state">
          <PinIcon size={38} />
          <h3>No services found</h3>
          <p>Try a different category or widen your search.</p>
           <div className="empty-actions">
      
        <button onClick={getLocation}>
         📍 Enable Location
        </button>
         <button onClick={() => {
          getLocation();
          fetchAll();
          }}>
            🔄 Refresh
          </button>

      <button onClick={()=> window.location.href="tel:112"}>
        📞 Emergency 112
      </button>
    </div>
  </div>
  
)}
      {!loading && visible.length > 0 && (
        <section className="nearby-grid">
          {visible.map((place, i) => {
            const meta = amenityMeta[place.tags?.amenity] || amenityMeta.hospital;
            const Icon = meta.Icon;
            return (
              <article key={i} className={`nearby-card nearby-card--${meta.tone}`}>
                <header>
                  <span className="nearby-card-icon">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h4>{place.tags?.name || "Unnamed Place"}</h4>
                    <span className="nearby-tag">{meta.label}</span>
                  </div>
                </header>
                <div className="nearby-dist">
                  <PinIcon size={15} />
                  {place.dist} km away
                </div>
                <div className="nearby-actions">
                  <a className="na-call" href={`tel:${meta.call}`}>
                    <PhoneIcon size={16} /> Call {meta.call}
                  </a>
                  <a
                    className="na-route"
                    href={`https://www.google.com/maps/dir/?api=1&origin=${location.lat},${location.lng}&destination=${place.lat},${place.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <RouteIcon size={16} /> Route
                  </a>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};

export default NearbyServices;
