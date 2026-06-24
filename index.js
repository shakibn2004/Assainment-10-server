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

// verify token middlewere
const JWKS = createRemoteJWKSet(new URL(`${process.env.CLIENT_URI}/api/auth/jwks`));


const verifyToken = async (req, res, next) => {
    const authHeader = req?.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const { payload } = await jwtVerify(token, JWKS);
        next();
    } catch (error) {
        console.log('error', error);
        return res.status(403).json({ message: "Forbidden" });
    }
};

// database and collection create and send data
async function run() {
    try {
        const db = client.db("assainment-10-server");
        const donationrequests = db.collection('donationrequests');
        const funding = db.collection('funding');
        const bddistricts = db.collection('bddistricts')
        const bdupazilas = db.collection('bdupazilas')
        const allusers = db.collection('allusers')

        // Districts and upazilas api
        app.get('/bddistricts', async (req, res) => {
            const result = await bddistricts.find().toArray();
            res.send(result);
        });
        app.get('/bddistricts/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                name: id,
            };
            const result = await bddistricts.findOne(query);

            res.send(result);
        });
        app.get('/bdupazilas', async (req, res) => {
            const result = await bdupazilas.find().toArray();
            res.send(result);
        });
        app.get('/bdupazilas/:id', async (req, res) => {
            const id = req.params.id;

            const query = {
                district_id: id
            };

            const result = await bdupazilas.find(query).toArray();

            res.send(result);
        });


        // main api
        app.get('/donationrequests', async (req, res) => {
            const result = await donationrequests.find().toArray();
            res.send(result);
        });

        app.get('/allusers', async (req, res) => {
            const result = await allusers.find().toArray();
            res.send(result);
        });

        app.get('/allusers/:email', async (req, res) => {
            const email = req.params.email;
            const query = {
                email: email
            }
            const result = await allusers.findOne(query);
            res.send(result);
        });

        app.get('/funding', async (req, res) => {
            const { page = 1, limit = 10 } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const totalData = await funding.countDocuments();
            const totalPage = Math.ceil(totalData / Number(limit));

            const result = await funding.find().sort({ _id: -1 }).skip(skip).limit(Number(limit)).toArray();
            res.send({ data: result, page: Number(page), totalPage, totalData, limit });
        });

        app.get('/donationrequests/:id', async (req, res) => {
            const id = req.params.id;
            const query = {
                _id: new ObjectId(id),
            };
            const result = await donationrequests.findOne(query);
            res.send(result);
        });

        app.get('/dashboard/my-donation-requests/:email', async (req, res) => {
            const email = req.params.email;
            const query = {
                requesterEmail: email,
            };
            const result = await donationrequests.find(query).toArray();
            res.send(result);
        });

        app.post('/funding', async (req, res) => {
            const result = await funding.insertOne(req.body);
            res.send(result);
        });

        app.post('/allusers', async (req, res) => {
            const result = await allusers.insertOne(req.body);
            res.send(result);
        })

        app.post('/donationrequests', async (req, res) => {
            const result = await donationrequests.insertOne(req.body);
            res.send(result);
        })

        // patch methods
        app.patch('/allusers/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;

            const result = await allusers.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: updatedData
                }
            );

            res.send(result);
        });

        app.patch('/donationrequests/:id', async (req, res) => {
            const id = req.params.id;
            const updatedData = req.body;

            const result = await donationrequests.updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: updatedData
                }
            )

            res.send(result);
        })

    } finally {
        // await client.close()
    }
}

run().catch(console.dir);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});