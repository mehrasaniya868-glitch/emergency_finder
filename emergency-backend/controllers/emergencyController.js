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

        const response = await fetch(
            "https://overpass-api.de/api/interpreter",
            {
                method: "POST",
                headers: {
                    "Content-Type": "text/plain"
                },
                body: query
            }
        );

        if (!response.ok) {
            throw new Error("Overpass API failed");
        }

        const data = await response.json();

        res.json(data);

    } catch (error) {
        console.error("Nearby places error:", error);

        res.status(500).json({
            message: "Unable to fetch nearby places"
        });
    }
}; 