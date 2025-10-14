const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

dotenv.config()

const app = express()

// middleware
app.use(cors())
app.use(express.json())

app.listen(process.env.PORT , ()=>{
    console.log(`server started at port ${process.env.PORT}`);
})
