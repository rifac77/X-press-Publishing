const errorhandler = require('errorhandler');
const express = require('express');
const artistsRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

artistsRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1;`, (err, recievedArtists) => {
        if(err){
            return next(err);
        }else{
            res.status(200).json({artists: recievedArtists});
        }
    })
});

artistsRouter.param('artistId', (req, res, next, artistId) => {
        const values = {$artistId: artistId};
        db.get(`SELECT * FROM Artist WHERE id = $artistId;`, values, (err, artist) => {
            if(err){
                next(err);
            }else if (artist){
                    req.artist = artist;
                    next();
                }else{
                    res.sendStatus(404);
                }
            });
});
        
artistsRouter.get('/:artistId', (req, res, next) => {
    res.status(200).send({artist: req.artist});
    next();
})

artistsRouter.post('/', function(req, res, next) {
    var name = req.body.artist.name;
    var dateOfBirth = req.body.artist.dateOfBirth;
    var biography = req.body.artist.biography;
    var isCurrentlyEmployed = req.body.artist.is_currently_employed === 0?0:1;
    if(!name || !dateOfBirth || !biography){
       return res.sendStatus(400);
    }
       
    db.run('INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed);', 
        {
        $name: name,
        $dateOfBirth: dateOfBirth,
        $biography: biography,
        $isCurrentlyEmployed: isCurrentlyEmployed
        },
        function(err) {
            if(err){
            next(err);
            }else{
                db.get(`SELECT * FROM Artist WHERE id= ${this.lastID};`, function(err, artist) {
                    if(err){
                            next(err);
                            }   
                    else{
                        res.status(201).json({artist: artist});
                        next();
                    }})
            }});
        })

artistsRouter.put('/:artistId', (req, res, next) => {
    var name = req.body.artist.name;
    var dateOfBirth = req.body.artist.dateOfBirth;
    var biography = req.body.artist.biography;
    var isCurrentlyEmployed = req.body.artist.is_currently_employed === 0?0:1;
    if(!name || !dateOfBirth || !biography){
       return res.sendStatus(400);
    }
    db.run('UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE id = $artistId;', 
        {
            $artistId: req.params.artistId,
            $name: name,
            $dateOfBirth: dateOfBirth,
            $biography: biography,
            $isCurrentlyEmployed: isCurrentlyEmployed
            }, 
            function (err){
                if(err){
                    next(err);
                }else{
                    db.get(`SELECT * FROM Artist WHERE id= ${req.params.artistId};`, function(err, artist) {
                        if(err){
                                next(err);
                                }   
                        else{
                            res.status(200).json({artist: artist});
                            next();
                        }})
                }

            }
);})

artistsRouter.delete('/:artistId', (req, res, next) => {
    var artistId = req.params.artistId;
    db.run('UPDATE Artist SET is_currently_employed = 0 WHERE id = $artistId', {
        $artistId: artistId
    },
    function(err){
        if(err){
            next(err);
        }else{
            db.get(`SELECT * FROM Artist WHERE id = ${artistId};`, function (err, artist) {
                if(err) {
                    next(err);
                }else{
                    res.status(200).json({artist: artist});
                    next();
                }
            })
        }
    }
    )
})
                    
   

module.exports = artistsRouter;