import 'dotenv/config'
import express from 'express'
import { MongoClient, ObjectId } from 'mongodb';
import cors from 'cors';



const app = express();
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGODB_URL);
export async function connectToMongoDB() {
    try {
        await client.connect();
        console.log("You successfully connected to MongoDB!");
        return client;
    } catch (err) {
        console.error("MongoDB connection failed:", err.message);
        process.exit(1);
    }
}

await connectToMongoDB();
const db = client.db("Wanderlust");
const destinationCollection = db.collection("destination_collections");

// http://localhost:5000/add-destination/

//Home
app.get('/', (req, res) => {
    res.send('Hello World!')
})

//New Destination Add
app.post('/add-destination', async (req, res, next) => {
    const newDestination = req.body
    if (!newDestination || typeof newDestination !== 'object' || Array.isArray(newDestination)) {
        return res.status(400).json({ error: 'A destination JSON object is required' })
    }
    try {
        const result = await destinationCollection.insertOne(newDestination)
        res.status(201).json({ insertedId: result.insertedId })
    } catch (err) {
        next(err)
    }
})

//Single Destination Delete
app.delete('/add-destination/:id', async(req, res)=>{
    const id = req.params.id;
    const result = await destinationCollection.deleteOne({_id: new ObjectId(id)});
    console.log(result);
    res.json(result)
    
})

//All Destinations Api
app.get('/add-destination', async (req, res, next) => {
    try {
        const cursor = await destinationCollection.find().toArray()
        res.json(cursor)
    } catch (err) {
        next(err)
    }
})

//Single Destination Api
app.get('/add-destination/:id', async (req, res, next) => {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid destination ID' })
    }
    try {
        const destination = await destinationCollection.findOne({ _id: new ObjectId(id) })
        if (!destination) {
            return res.status(404).json({ error: 'Destination not found' })
        }
        res.json(destination)
    } catch (err) {
        next(err)
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.use((err, req, res, next) => {
    console.error(err.message)
    const status = err.status || err.statusCode || 500
    res.status(status).json({ error: err.expose ? err.message : 'Internal server error' })
})

process.on('SIGINT', async () => {
    await client.close()
    process.exit(0)
})