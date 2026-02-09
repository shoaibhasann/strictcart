import mongoose, { Connection } from "mongoose";

if(!process.env.MONGO_URI){
    console.log("❌ MONGO_URI is not defined");
}

let cachedConnection : Connection | null = null;

export default async function connectDB(){

    if(cachedConnection){
        console.log("✅ Already connected to DB");
        return cachedConnection;
    }

    try {
        const cnx = await mongoose.connect(process.env.MONGO_URI!);
        cachedConnection = cnx.connection;
        console.log("✅ Connected to DB");
        return cachedConnection;
    } catch (err) {
        console.log("Error while connecting to DB: ", err);
        throw err;
    }
}