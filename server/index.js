'use strict';

const Database = require("./database");
const express = require('express');
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const { initAuthentication, isLoggedIn, initTemporarySession } = require("./auth");
const passport = require("passport");

// init express
const app = new express();
const port = 3001;
const db = new Database("indovina_chi.db");

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

initAuthentication(app, db);

//per poter inviare le immagini
app.use('/img', express.static(__dirname + '/img'));



app.get("/api/carte/:num", async (req, res) => {
  try {
    let cards = undefined;
    let uid = 0;
    if(req.user){
      uid=req.user.id
      
    }else{
      uid=req.sessionID;
    }
    await db.deletePending(uid)
    .then(async ()=>{
      await db.getCards(req.params.num,uid)
      .then(async c => {
          cards = c;       
      });
    })
   
    res.json({cards});
  } catch {
    res.status(500).json({ errors: ["Database error"] });
  }
});

app.post(
  "/api/try",
  body("val", "Deve essere un numero maggiore di zero").isInt({ min: 1 }),
  async (req, res) => {
    // Check if validation is ok
    const err = validationResult(req);
    const errList = [];
    if (!err.isEmpty()) {
      errList.push(...err.errors.map(e => e.msg));
      return res.status(400).json({ errors: errList });
    }
    try {
      let uid = 0;
      if(req.user){
        uid=req.user.id
      }else{
        uid=req.sessionID;
      }
  
      await db.ask(uid,req.body.val)
        .then(async r => {
            if(r.trovato){
              res.json(true);
            }else{
              res.json(false);
            }
                  
        });
      
    } catch {
      res.status(500).json({ errors: ["Database error"] });
    }
  });

app.post(
  "/api/guess",
  body("card", "Deve essere un numero maggiore di zero").isInt({ min: 1 }),
  body("punti", "deve essere un numero maggiore di zero").isInt({ min: 1 }),
  async (req, res) => {
    // Check if validation is ok
    const err = validationResult(req);
    const errList = [];
    if (!err.isEmpty()) {
      errList.push(...err.errors.map(e => e.msg));
      return res.status(400).json({ errors: errList });
    }
    try {
      let uid = 0;
      if(req.user){
        uid=req.user.id
      }else{
        uid=req.sessionID;
      }
  
      await db.guess(uid)
        .then(async r => {
            if(req.body.card===r.ID_CARD){
              if(req.user){
                const punti= req.body.punti > 0 ? req.body.punti : 0;
                await db.updateGame(punti,uid);
              }
              res.json([true,r.ID_CARD]);
            }else{
              if(req.user){
                await db.updateGame(0,uid);
              }
              res.json([false,r.ID_CARD]);
            }
                  
        });
    } catch {
      res.status(500).json({ errors: ["Database error"] });
    }
  });

app.delete("/api/clear", async (req, res) => {
  try {

    if(req.user){
      uid=req.user.id
    }else{
      uid=req.sessionID;
    }

    await db.deletePending(uid);
    res.end();
  } catch {
    res.status(500).json({ errors: ["Database error"] });
  }
});

app.get("/api/history", async (req, res) => {
  try {
    let history = undefined;
    await db.getHistory(req.user.id)
      .then(async h => {
          history = h;     
      });
    res.json({history});
  } catch {
    res.status(500).json({ errors: ["Database error"] });
  }
});

app.get("/api/history/total", async (req, res) => {
  try {
    let total = undefined;
    await db.getTotal(req.user.id)
      .then(async tot => {
          total = tot.TOT;       
      });
    res.json({total});
  } catch {
    res.status(500).json({ errors: ["Database error"] });
  }
});

app.post(
  "/api/attributi",
  body("cards", "Deve avere contenuti").isArray().isLength({ min: 2 }),
  async (req, res) => {
    // Check if validation is ok
    const err = validationResult(req);
    const errList = [];
    if (!err.isEmpty()) {
      errList.push(...err.errors.map(e => e.msg));
      return res.status(400).json({ errors: errList });
    }
    try {
      let attributi = undefined;
      await db.getTipologie(req.body.cards)
        .then(async t => {
          attributi = t;       
        });
      res.json({attributi});
    } catch {
      res.status(500).json({ errors: ["Database error"] });
    }
  });

app.post(
  "/api/valori",
  body("type", "Deve essere una parola").isString(),
  body("cards", "Deve avere contenuti").isArray().isLength({ min: 2 }),
  async (req, res) => {
    // Check if validation is ok
    const err = validationResult(req);
    const errList = [];
    if (!err.isEmpty()) {
      errList.push(...err.errors.map(e => e.msg));
      return res.status(400).json({ errors: errList });
    }
    try {
      const valori = await db.getValuesFromTipologie(req.body.type, req.body.cards);
      res.json({ valori });
    } catch {
      res.status(500).json({ errors: ["Database error"] });
    }
  });




app.post(
  "/api/session",
  body("username", "non è un'email valida").isEmail(),
  body("password", "password non può essere vuoto").isString().notEmpty(),
  (req, res, next) => {
    // Check if validation is ok
    const err = validationResult(req);
    const errList = [];
    if (!err.isEmpty()) {
      errList.push(...err.errors.map(e => e.msg));
      return res.status(400).json({ errors: errList });
    }

    // Perform the actual authentication
    passport.authenticate("local", (err, utente) => {
      if (err) {
        res.status(err.status).json({ errors: [err.msg] });
      } else {
        req.login(utente, err => {
          if (err) return next(err);
          else {
            res.json({ id: utente.id, email: utente.email,username: utente.username});
             
          }
        });
      }
    })(req, res, next);
  }
);
//Logout
app.delete("/api/session", isLoggedIn, (req, res) => {
  req.logout(() => res.end());
});

app.get("/api/session/current", isLoggedIn, async (req, res) => {
  let err = false;
  if (!err) res.json({ id: req.user.id, email: req.user.EMAIL, username: req.user.USERNAME});
});

// activate the server
app.listen(port, () => console.log(`Server running on http://localhost:${port}/`));