'use strict';

var mongoose = require('mongoose'),
  Vote = mongoose.model('Vote'),
  Tile = mongoose.model('Tile'),
  User = mongoose.model('User'),
  _ = require('lodash');

// Create vote
exports.create = function(req, res) {
  var vote = new Vote(req.body);
  var id = vote.tile;
  var data = [];
  var choice = vote.choice;
  // var user = req.user.displayName;
  var sessionID = req.sessionID;

  //Grab choice from angular controller
  if (choice == 'upVote') {
    Tile.findById(id, function(err, doc) {
      if (doc.votes.length > 0) {
        for (var i = 0; i < doc.votes.length; i++){
          if (doc.votes[i] == sessionID) {
            console.log('ALREADY VOTED');
          }
        }
      } else {
        doc.votesUp.push(sessionID);
        doc.votes.push(sessionID);
        doc.save();
        console.log(sessionID + ' has voted for ' + id);

        vote.save(function(err) {
          if (err) {
            return res.send('users/signup', {
              errors: err.errors,
              vote: vote
            });
          } else {
            res.jsonp(vote);
          }
       });
      }
    });
  } else if (choice == 'downVote') {
    Tile.findById(id, function(err, doc) {
      if (doc.votes.length > 0) {
        for (var i = 0; i < doc.votes.length; i++){
          if (doc.votes[i] == sessionID) {
            console.log('ALREADY VOTED');
          } 
        }
      }
      else {
        doc.votesUp.push(sessionID);
        doc.votes.push(sessionID);
        doc.save();
        console.log(sessionID + ' has vote for ' + id);

        vote.save(function(err) {
          if (err) {
            return res.send('users/signup', {
              errors: err.errors,
              vote: vote
            });
          } else {
            res.jsonp(vote);
          }
       });
      };
    });
  }
};

// Update a vote

exports.update = function(req, res) {
  var vote = req.vote;

  vote = _.extend(vote, req.body);

  vote.save(function(err) {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(vote);
    }
  });
};

// Show current vote
exports.read = function(req, res) {
  res.jsonp(req.vote);
};

// Delete a vote
exports.delete = function(req, res) {
  var vote = req.vote;

  vote.remove(function(err) {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(vote);
    }
  });
};

// List of votes 
exports.list = function(req, res) {
  Vote.find().exec(function(err, votes) {
    if (err) {
      res.render('error', {
        status: 500
      });
    } else {
      res.jsonp(votes);
    }
  });
};

// Vote middleware
exports.voteByID = function(req, res, next, id) {
  Vote.load(id, function(err, vote) {
    if (err) return next(err);
    if (!vote) return next(new Error('Failed to load vote ' + id));
    req.vote = vote;
    next();
  });
};

// vote authorization middleware
exports.hasAuthorization = function(req, res, next) {
  if (req.vote.user.id !== req.user.id) {
    return res.send(403, 'User is not authorized');
  }
  next ();
};