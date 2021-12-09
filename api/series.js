const express = require('express');
const seriesRouter = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
const issuesRouter = require('./issues.js');

//issues router redirect
seriesRouter.use('/:seriesId/issues', issuesRouter);

//get routers
seriesRouter.get('/', (req, res, next) => {
    db.all('SELECT * FROM Series;', (err, series) => {
        if(err) {
            next(err);
        }else{
            res.status(200).json({series: series});
        }

    })
})

seriesRouter.param('seriesId', (req, res, next, seriesId) => {
    const values = {$seriesId: seriesId};
    db.get(`SELECT * FROM Series WHERE Series.id = $seriesId;`, values, (err, series) => {
        if(err){
            next(err);
        }else if (series){
                req.series = series; 
                next();
            }else{
                res.sendStatus(404);
            }
        });
});

seriesRouter.get('/:seriesId', (req, res, next) => {
            res.status(200).json({series: req.series});
            next();
    })

//post routers
seriesRouter.post('/', function(req, res, next) {
    var name = req.body.series.name;
    var description = req.body.series.description;
    if(!name || !description){
        return res.sendStatus(400);
    }
        
    db.run('INSERT INTO Series (name, description) VALUES ($name, $description);', 
        {
        $name: name,
        $description: description
        },
        function(err) {
            if(err){
            next(err);
            }else{
                db.get(`SELECT * FROM Series WHERE id= ${this.lastID};`, function(err, series) {
                    if(err){
                            next(err);
                            }   
                    else{
                        res.status(201).json({series: series});
                        next();
                    }})
            }});
        })
//put router
seriesRouter.put('/:seriesId', (req, res, next) => {
    var name = req.body.series.name;
    var description = req.body.series.description;
    if(!name || !description){
        return res.sendStatus(400);
    }
    db.run('UPDATE Series SET name = $name, description = $description WHERE id = $seriesId;', 
    {
        $seriesId: req.params.seriesId,
        $name: name,
        $description: description
        
        }, 
            function (err){
                if(err){
                    next(err);
                }else{
                    db.get(`SELECT * FROM Series WHERE id= ${req.params.seriesId};`, function(err, series) {
                        if(err){
                                next(err);
                                }   
                        else{
                            res.status(200).json({series: series});
                            next();
                        }})
                }

            }
);})
//delete router
seriesRouter.delete('/:seriesId', (req, res, next) => {
    db.get('SELECT * FROM Issue WHERE series_id = $seriesId;', {
        $seriesId: req.params.seriesId
    }, (err, series) => {
        if(err) {
            next(err);
        }else if(series){
             return res.sendStatus(400);
        }else{
            db.run('DELETE FROM Series WHERE Series.id = $seriesId;', {
                $seriesId: req.params.seriesId
            },(err) => {
                if(err) {
                    next(err);
                }else{
                    res.sendStatus(204);
                }
            })
        }
    })
})


module.exports = seriesRouter;