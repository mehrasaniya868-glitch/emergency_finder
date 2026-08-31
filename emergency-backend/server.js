const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.log(err));
const app = express();

app.use (cors());
app.use(express.json());

const emergencyRoutes = require('./routes/emergencyRoutes');
app.use("/",emergencyRoutes);

app.get("/",(req,res)=>{
    res.send("Emergency Backend Running 🚀");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT,"0.0.0.0", () => {
    console.log(`Server is running on port ${PORT}`);
});