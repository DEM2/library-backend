import {request, response} from "express";
import cors from "cors";
import express from "express";
import dbConnect from "./utils/dbConnect";
import router from "./routes/Routes";

const app = express()
dbConnect();

app.use(cors())
app.use(express.json())

const server = "/api/"

app.use(server + "library", router )

function routeNotFound(request: express.Request, response: express.Response){
    response.status(404).json({
        message: "Route not found"
    })
}

app.use(routeNotFound)

app.listen(8080, ()=>{
    console.log("Server listening to port 8080")
})