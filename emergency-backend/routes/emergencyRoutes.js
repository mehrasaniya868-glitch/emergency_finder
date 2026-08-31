const express = require("express");
const router = express.Router();

const {
  addEmergency,
  getEmergencies,
  updateEmergency,
  deleteEmergency,
} = require("../controllers/emergencyController");
router.post("/emergency", addEmergency);
router.get("/emergency", getEmergencies);
router.put("/emergency/:index", updateEmergency);
router.delete("/emergency/:index", deleteEmergency);

router.get("/nearby", async (req, res) => {
  try {
    const { lat, lon, type } = req.query;

    if (!lat || !lon || !type) {
      return res.status(400).json({
        error: "lat, lon and type are required",
      });
    }

    let amenity;

    if (type === "hospital") {
      amenity = "hospital";
    } else if (type === "police") {
      amenity = "police";
    } else if (type === "fire_station") {
      amenity = "fire_station";
    } else if (type === "pharmacy") {
      amenity = "pharmacy";
    } else {
      return res.status(400).json({
        error: "Invalid service type",
      });
    }

    const query = `
      [out:json][timeout:15];

        node["amenity"="${amenity}"](around:5000,${lat},${lon});

      out center;
    `;

console.log("Sending request to Overpass...");
console.log("Type:", type);
console.log("Amenity:", amenity);
console.log("Location:", lat, lon);

const response = await fetch(
  "https://overpass-api.de/api/interpreter",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "EmergencyFinder/1.0",
    },
    body: `data=${encodeURIComponent(query)}`,
  }
);

console.log("Overpass status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();

   console.error("OVERPASS ERROR STATUS:", response.status);
   console.error("OVERPASS ERROR BODY:", errorText);

   return res.status(response.status).json({
    error: "Overpass API request failed",
    details: errorText,
    });

  }
    const data = await response.json();
      
    console.log("Overpass results:", data.elements?.length);
    console.log("First result:", data.elements?.[0]);

    res.json(data);

  } catch (error) {
    console.error("Nearby services error:", error);

    res.status(500).json({
      error: "Failed to fetch nearby services",
    });
  }
});


module.exports = router;