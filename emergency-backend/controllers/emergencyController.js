const Emergency = require("../models/Emergency");
exports.addEmergency = async(req,res) => {
    try {
        const newEmergency =new Emergency(req.body);

        await newEmergency.save();
        res.send("Emergency Added ✅");
    } catch (error) {
        res.status(500).send(error.message);
    }
};
    exports.getEmergencies = async (req,res) => {
        try{
            const data =await Emergency.find();
            res.json(data);
        } catch (error) {
             res.status(500).send(error.message);
        }
    };

    exports.updateEmergency = async(req,res) => {
        try {
            const id = req.params.id;
            await Emergency.findByIdAndUpdate(id, req.body);
            res.send("Emergency Updated✏️");

        }catch (error) {
             res.status(500).send(error.message);
        }
    };
        
    exports.deleteEmergency = async(req,res) => {
        try {
         const id =req.params.id;
            await Emergency.findByIdAndDelete(id);
            res.send("Emergency Deleted🗑️");
        } catch (error) {
            res.status(500).send(error.message);
        }
    };

   exports.getNearbyPlaces = async (req, res) => {
    try {
        const { lat, lon, type } = req.query;

        if (!lat || !lon || !type) {
            return res.status(400).json({
                message: "Latitude, longitude and type are required"
            });
        }

        const query = `
            [out:json] [timeout:10];
            (
                node["amenity"="${type}"](around:25000,${lat},${lon});
            );
            out body;
        `;

        const overpassServers = [
            "https://overpass-api.de/api/interpreter",
            "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
            "https://overpass.private.coffee/api/interpreter"
        ];

        let lastError = null;

        for (const server of overpassServers) {
            try {
                console.log("Trying Overpass:", server);

                const response = await fetch(server, {
                    method: "POST",
                    headers: {
                        "Content-Type": "text/plain",
                        "User-Agent": "EmergencyFinder/1.0"
                    },
                    body: query
                });

                console.log("Overpass status:", response.status);

                if (!response.ok) {
                    const errorText = await response.text();

                    console.error(
                        "Overpass error:",
                        response.status,
                        errorText
                    );

                    lastError = new Error(
                        `Overpass returned ${response.status}`
                    );

                    continue;
                }

                const data = await response.json();

                console.log(
                    "Overpass results:",
                    data.elements?.length
                );

                return res.json(data);

            } catch (error) {
                console.error(
                    "Overpass server failed:",
                    server,
                    error.message
                );

                lastError = error;
            }
        }

        console.error("All Overpass servers failed:", lastError);

        return res.status(503).json({
            message: "Nearby service is temporarily unavailable"
        });

    } catch (error) {
        console.error("Nearby places error:", error);

        res.status(500).json({
            message: "Unable to fetch nearby places"
        });
    }
};