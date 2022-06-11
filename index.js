const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const port = process.env.PORT || 5000;
const app = express();

// middleWare
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kr4e6pc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const servicesCollection = client.db("carGenius").collection("services")
        // get multiple services
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = servicesCollection.find(query);
            const services = await cursor.toArray();
            console.log('services');
            res.send(services)
        })

        //get a single service
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.send(service)
        })

        // post to database
        app.post('/service', async(req, res) =>{
            const newService = req.body;
            const result = await servicesCollection.insertOne(newService);
            res.send(result);
        });

        // delete to database 
        app.delete('/service/:id', async (req,res) => {
            const id = req.params.id;
            const query = {_id : ObjectId(id)};
            const result = await servicesCollection.deleteOne(query);
            res.send(result)
        })
    }
    finally {
        
    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('running')
})

app.listen(port, () => {
    console.log(port);
})