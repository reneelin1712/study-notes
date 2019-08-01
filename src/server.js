import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';

const withDB = async (operations,res)=>{
    try{
        const client = await MongoClient.connect('mongodb://localhost:27017',{ useNewUrlParser: true });
        const db = client.db('study-notes');
       
        await operations(db);
        
        client.close();
        } catch(error) {
            res.status(500).json({message: 'Error connect', error});
        }
}

const app = express();

app.use(express.static(path.join(__dirname,'/build')));
app.use(bodyParser.json())

app.get("/api/notes",async (req,res)=>{
    withDB(async (db)=>{
        const note = await db.collection('notes').find({}).toArray();
        res.status(200).json(note);
    },res)
   
})

app.get("/api/notes/:id",async (req,res)=>{
    withDB(async (db)=>{
        const noteId = req.params.id;
        const note = await db.collection('notes').findOne({id:noteId});
        res.status(200).json(note);
    },res)
})


app.post("/api/notes/add", async (req,res)=>{
    withDB(async (db)=>{
        var myobj = req.body;
        await db.collection('notes').insertOne(myobj);
        const updatenote = await db.collection('notes').find({}).sort({date: -1}).toArray();
        res.status(200).json(updatenote);
    },res)
})

app.get('*', (req,res)=>{
    res.sendFile(path.join(__dirname+'/build/index.html'));
})


app.listen(8000,()=> console.log("listening on port 8000"));