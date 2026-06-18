const express = require("express");
const dontenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { createRemoteJWKSet, jwtVerify } = require("jose");
dontenv.config();

const uri = process.env.MONGODB_URI;

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

// database and collection create and send data
async function run() {
    try {
        const db = client.db("assainment-10-server");
        const donationrequests = db.collection('donationrequests');
        const bddistricts = db.collection('bddistricts')
        const bdupazilas = db.collection('bdupazilas')

        app.get('/donationrequests', async (req, res) => {
            const result = await donationrequests.find().toArray();
            res.send(result);
        });
        app.get('/bddistricts', async (req, res) => {
            const result = await bddistricts.find().toArray();
            res.send(result);
        });
        app.get('/bdupazilas', async (req, res) => {
            const result = await bdupazilas.find().toArray();
            res.send(result);
        });

    } finally {
        // await client.close()
    }
}

run().catch(console.dir);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});