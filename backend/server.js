const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()

// middleware
app.use(cors())
app.use(express.json())

// db connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => { console.log("MongoDB connected") })
  .catch((err) => { console.log(err) })

// routes
app.use("/api/auth", require("./routes/authRoute.js"))
app.use("/api/users", require("./routes/usersRoute.js"))

app.listen(process.env.PORT , ()=>{
    console.log(`server started at port ${process.env.PORT}`);
})
