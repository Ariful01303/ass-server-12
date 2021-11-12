const express =require('express')
const { MongoClient, LEGAL_TCP_SOCKET_OPTIONS } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const cors=require('cors')
const app =express()

// port 
const port=process.env.PORT || 5000;


// middleware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jwphj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      console.log('connect to database')
      const database = client.db("bikerBd");
      const servicesCollection = database.collection("services");
      const detailCollection = client.db("detailService").collection("detail");
      const adminCollection = database.collection("adminUserInfo");
      const myreviewCollection = client.db("reviewCall").collection("review");
     
      
    //   get api 
    app.get('/services',async(req,res)=>{
        const cursor = servicesCollection.find({});
        const servertest=await cursor.toArray();
        res.send(servertest)
    })
    // post api
    app.post('/services', async (req, res) => {
        const service = req.body;
        console.log('hit the post api', service);

        const result = await servicesCollection.insertOne(service);
        console.log(result);
        res.json(result)
    });
    app.delete("/services/:id", async(req, res) => {
     
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await servicesCollection.deleteOne(query);
        res.json(result);
    })
    // get review api
    app.get('/review', async (req, res) => {
      const cursor = myreviewCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
  });
    //
    // // // add data 
    app.post('/review', async (req, res) => {
        console.log(req.body);
        const result = await myreviewCollection.insertOne(req.body);
       res.json(result)
        
      });
     
      
     
      // Add detail
    app.post('/detail',(req,res)=>{
        detailCollection.insertOne(req.body).then((result) => {
            res.send(result);
          });
    })
      // get all products by email query
  app.get("/detail/:email", (req, res) => {
    console.log(req.params);
    detailCollection
      .find({ email: req.params.email })
      .toArray((err, results) => {
        res.send(results);
      });
  });
//   delete 
  app.delete("/detail/:id", async(req, res) => {
     
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await detailCollection.deleteOne(query);
    res.json(result);
})

   //    Admin handling 
app.post("/adminUserInfo", async (req, res) => {
    console.log("req.body");
    const result = await adminCollection.insertOne(req.body);
    res.send(result);
    
  });
  //  make admin

  app.put("/adminMaker", async (req, res) => {
    const filter = { email: req.body.email };
    const result = await adminCollection.find(filter).toArray();
    if (result) {
      const documents = await adminCollection.updateOne(filter, {
        $set: { role: "admin" },
      });
     
    }
    
  });
  app.get("/adminCheker/:email", async (req, res) => {
    const result = await adminCollection
      .find({ email: req.params.email })
      .toArray();
    console.log(result);
    res.send(result);
  });

    }

     finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('welcome to bd bike webserver')
});
app.listen(port,()=>{
    console.log('server port',port)
})