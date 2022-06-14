const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const app = express();

// middleWare
app.use(cors());
app.use(express.json());



function verfiyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ massage: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.LOGIN_JWT_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ massage: 'Forbidden access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next()
    })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kr4e6pc.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const servicesCollection = client.db("carGenius").collection("services")
        const orderCollection = client.db('carGenius').collection('orders')


        // use iwt 
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.LOGIN_JWT_TOKEN, { expiresIn: '1d' })
            res.send({ accessToken })
        })
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
        app.post('/service', async (req, res) => {
            const newService = req.body;
            const result = await servicesCollection.insertOne(newService);
            res.send(result);
        });

        // delete to database 
        app.delete('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.send(result)
        })
        // orders colleation to a single user
        app.get('/orders', verfiyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query)
                const result = await cursor.toArray();
                res.send(result)
            }
            else {
                res.status(403).send({ massage: 'Forbidden access' })
            }
        })
        // post to oreders
        app.post('/oreders', async (req, res) => {
            const oreder = req.body;
            const result = await orderCollection.insertOne(oreder);
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