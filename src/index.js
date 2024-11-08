// Here we import everything in here 
import {app} from "./app.js"
import connectDB from "./db/db.js";

connectDB().then(() => {
    app.listen(process.env.PORT, () => {
        console.log("Server working in the port: " + process.env.PORT);
    })
    
}).catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})
