const CryptoJS = require('crypto');
const { v4: uuidv4 } = require('uuid');
const short = require('short-uuid');
const express = require('express');
const bodyParser= require('body-parser');
const MongoClient = require('mongodb').MongoClient
const mongo = require('mongodb');
const app = express();
const url = "mongodb://localhost:27017/citation";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

MongoClient.connect(url, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database');
        const db = client.db('citation');
        const citationCollection = db.collection('citations');
        const auteurCollection = db.collection('editeurs');

            //----------------------------------------------- Collection Citations------------------------------------------------------------------------//
        //Get Citation
        app.get('/api/citations', (req, res) => {
            citationCollection.find().toArray()
                .then(results => {
                    console.log(results);
                    res.send(results);
                }).catch(error => console.error(error))
        });

        //Get by Author
        app.get('/api/citation/auteur/:auteur', (req, res) => {
            citationCollection.find({"Auteur" : req.params.auteur}).toArray()
                .then(results => {
                    console.log(results);
                    res.send(results);
                }).catch(error => console.error(error))
        });

        //Get by character citation
        app.get('/api/citation/character/:character', (req, res) => {
            citationCollection.find({"citations" : {'$regex': '.*'+req.params.character+'.*'}}).toArray()
                .then(results => {
                    console.log(results);
                    res.send(results);
                }).catch(error => console.error(error))
        });

        //Get by character citation and Author
        app.get('/api/citation/search/:auteur&:character', (req, res) => {
            let auteur = req.params.auteur;
            let character = req.params.character;
            citationCollection.find({
                                        "Auteur": auteur,
                                        "citations" : {'$regex': '.*'+character+'.*'}
                                    }).toArray()
                .then(results => {
                    console.log(results);
                    res.send(results);
                }).catch(error => console.error(error))
        })

        //Post Citation
        app.post('/api/citation/:email',(req, res) => {
            let _id = short.generate();
            citationCollection.insertOne({
                "_id": _id,
                "Auteur" : req.body.Auteur,
                "citations" : req.body.citations,
                "oeuvre" : req.body.oeuvre,
                "date" : req.body.date,
                "langue" : req.body.langue,
                "favNumber": 0,
            });
            let item = {
                $push :{
                    "citation_poster": _id,
                }
            }
            auteurCollection.updateOne({"email": req.params.email },item,{ upsert: true }).then(results =>{
                console.log(results.status);
                res.send(results);
            }).catch(error => console.error(error));

        });


        //Delete citation By ID  exemple : ObjectId("604a39a6e9698f438cf32f47")
        app.delete('/api/citation/delete/:id',(req, res) => {
            let id = req.params.id;
            citationCollection.deleteOne({ "_id": id });

            let item ={
                $pull:{
                    citation_poster: id,
                }

            }
            auteurCollection.updateMany({},item,{multi: true}).then(results =>{
                console.log(results.status);
                res.json({ success: id })
            }).catch(error => console.error(error))
        });


        //Update Citation By ID
        app.put('/api/citation/update/:id',(req, res) => {
            let id = req.params.id;
            let newValue = {$set : {
                    "Auteur": req.body.Auteur,
                    "citations": req.body.citations,
                    "oeuvre": req.body.oeuvre,
                    "date": req.body.date,
                    "langue": req.body.langue,
                }
            }
            citationCollection.updateOne({ _id: new mongo.ObjectId(id) },newValue).then(results =>{
                console.log(results.status);
                res.json({ success: id })
            }).catch(error => console.error(error))
        });
        //----------------------------------------------- Collection Auteur ------------------------------------------------------------------------//

        //Post Editeur create account
        app.post('/api/editeur/create/',(req, res) => {
            let hashMotDePasse = CryptoJS.createHash('md5').update(req.body.mot_de_passe).digest('hex');
            let auteur = {
                "nom" : req.body.nom,
                "email" : req.body.email,
                "mot_de_passe" : hashMotDePasse,
            }
            auteurCollection.insertOne(auteur).then(results =>{
                console.log(results.status);
                res.send(results);
            }).catch(error => console.error(error));
        });

        //Post Editeur add favoris
        app.put('/api/editeur/addFav/:email&:idCitations',(req, res) => {

            let item = {
                $push :{
                    "favoris": req.params.idCitations,
                }
            }

            auteurCollection.updateOne({"email": req.params.email },item,{ upsert: true });
            citationCollection.updateOne({"_id": req.params.idCitations},{$inc : {"favNumber":1}}).then(results =>{
                console.log(results);
                res.send(results);
            }).catch(error => console.error(error));

        });

        //Get Editeur
        app.get('/api/editeur/users/:email',(req, res) => {
            auteurCollection.find({"email": req.params.email }).toArray().then(results =>{
                console.log(results.status);
                res.send(results);
            }).catch(error => console.error(error));

        });

        //----------------------------------------------- requete de statistique ------------------------------------------------------------------------//

        // La personne avec le plus de citation
        app.get('/api/editeur/bestUsers/',(req, res) => {
            auteurCollection.find({"citation_poster":{$ne:null}}).limit(1).sort({"citation_poster": -1}).toArray().then(results =>{
                console.log(results.status);
                res.send(results);
            }).catch(error => console.error(error));

        });

        // Le nombre de citation sans auteur
        app.get('/api/editeur/unknowEditeur/',(req, res) => {
            citationCollection.aggregate(
                [
                    { $match: { Auteur: { $eq: null } } },
                    { $group :
                            {
                                "_id" : "$Auteur",
                                " nbCitationSansAuteur": {$sum: 1}
                            }
                    }
                ]
            ).toArray().then(results =>{
                console.log(results);
                res.send(results);
            }).catch(error => console.error(error));

        });

        app.get('/api/editeur/bestCitationFav/',(req, res) => {
            citationCollection.find({"favNumber":{$ne:null}}).limit(3).sort({"favNumber": -1}).toArray().then(results =>{
                console.log(results.status);
                res.send(results);
            }).catch(error => console.error(error));

        });

        app.get('/api/editeur/bestEditeurCitationFav/',(req, res) => {
            citationCollection.aggregate([
                {$match: {}},
                {$group: {_id: "$Auteur", total_fav : {$sum : "$favNumber"}}},
                {$sort: {total_fav: -1}},
                {$limit: 1}
            ]).toArray().then(results =>{
                console.log(results.status);
                res.send(results);
            }).catch(error => console.error(error));

        });





    })

app.listen(3000, function() {
    console.log('listening on 3000')
});
