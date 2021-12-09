const express = require('express');
const issuesRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

issuesRouter.param('issueId', (req, res, next, issueId) =>{
    db.get('SELECT * FROM Issue WHERE Issue.id = $issueId;', {
        $issueId: issueId
    }, (err, issue) => {
        if(err){
            next(err);
        }else if(issue){
            next();
        }else{
             res.sendStatus(404);
        }
    })
})

//general get
issuesRouter.get('/', (req, res, next) => {
    values = {
        $seriesId: req.params.seriesId
    };
    db.all('SELECT * FROM Issue WHERE Issue.series_id = $seriesId;', 
        values,
     (err, issues) => {
        if(err) {
            next(err);
        }else{
            res.status(200).json({issues: issues});
        }

    })
})
//create issue
issuesRouter.post('/', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    if(!issueNumber || !publicationDate || !name) {
        return res.sendStatus(400);
    }
    db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', 
    {
        $artistId: artistId
    },
    (err, artist) => {
        if(err){
            next(err);
        }else{
            if(!artist) {
                return res.sendStatus(400);
            }
        }
    })

    db.run('INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($name, $issueNumber, $publicationDate, $artistId, $seriesId);',
    {
        $name: name,
        $issueNumber: issueNumber,
        $publicationDate: publicationDate,
        $artistId: artistId,
        $seriesId: req.params.seriesId
    },
    function(err) {
        if(err){
            next(err);
        }else{
             db.get(`SELECT * FROM Issue WHERE Issue.id = ${this.lastID};`, function(err, issue){
            if(err){
                next(err);
            }else{
                res.status(201).json({issue: issue});
            }
        })
        }
       
    }    
    )
})

//update issue

issuesRouter.put('/:issueId', (req, res, next) => {
    const name = req.body.issue.name;
    const issueNumber = req.body.issue.issueNumber;
    const publicationDate = req.body.issue.publicationDate;
    const artistId = req.body.issue.artistId;
    const issueId = req.params.issueId;
    if(!issueNumber || !publicationDate || !name) {
        return res.sendStatus(400);
    };
    db.get('SELECT * FROM Artist WHERE Artist.id = $artistId', 
    {
        $artistId: artistId
    },
    (err, artist) => {
        if(err){
            next(err);
        }else{
            if(!artist) {
                return res.sendStatus(400);
            }
        }
    });
    db.run('UPDATE Issue SET name = $name, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId WHERE Issue.id = $issueId;', 
        {
            $name: name,
            $issueNumber: issueNumber,
            $publicationDate: publicationDate,
            $artistId: artistId,
            $issueId: issueId
        }, function (err) {
            if(err) {
                next(err);
            }else{
                db.get(`SELECT * FROM Issue WHERE Issue.id = ${issueId};`, function (err, issue) {
                    if(err){
                        next(err);
                    }else{
                        res.status(200).json({issue: issue});
                    }
                })
            }
        }
    )

})

//delete issue

issuesRouter.delete('/:issueId', (req, res, next) => {
    db.run('DELETE FROM Issue WHERE Issue.id = $issueId;', {
        $issueId: req.params.issueId
    }, (err) => {
        if(err){
            next(err);
        }else{
            res.sendStatus(204);
        }
    })
})

module.exports = issuesRouter;
