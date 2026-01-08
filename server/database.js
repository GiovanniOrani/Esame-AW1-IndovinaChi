"use strict"

const sqlite = require("sqlite3");
const crypto = require("crypto");
const dayjs = require('dayjs');
/**
 * Wrapper around db.all
 */
const dbAllAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else resolve(rows);
  });
});

/**
 * Wrapper around db.run
 */
const dbRunAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, err => {
    if (err) reject(err);
    else resolve();
  });
});

/**
 * Wrapper around db.get
 */
const dbGetAsync = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else resolve(row);
  });
});

/**
 * Interface to the sqlite database for the application
 *
 * @param dbname name of the sqlite3 database file to open
 */
function Database(dbname) {
  this.db = new sqlite.Database(dbname, err => {
    if (err) throw err;
  });

  /**
 * Authenticate a user from their email and password
 * 
 * @param email email of the user to authenticate
 * @param password password of the user to authenticate
 * 
 * @returns a Promise that resolves to the user object {id, username, name, fullTime}
 */
  this.authUser = (email, password) => new Promise((resolve, reject) => {

    dbGetAsync(this.db, "SELECT * FROM UTENTI WHERE EMAIL = ?", [email]
    )
      .then(utente => {

        // If there is no such user, resolve to false.
        // This is used instead of rejecting the Promise to differentiate the
        // failure from database errors
        if (!utente) resolve(false);

        // Verify the password
        crypto.scrypt(password, utente.SALT, 32, (err, hash) => {
          if (err) reject(err);

          if (crypto.timingSafeEqual(hash, Buffer.from(utente.HASH, "hex")))
            resolve({ id: utente.ID, email: utente.EMAIL, username: utente.USERNAME });
          else resolve(false);
        });
      })
      .catch(e => reject(e));
  });


  this.getUser = async id => {
    const user = await dbGetAsync(
      this.db,
      "SELECT EMAIL, USERNAME FROM UTENTI WHERE ID = ?",
      [id]
    );

    return { ...user, id };
  };



  this.getCards = async (num, idUtente) => {
    const cards = (await dbAllAsync(this.db, "SELECT ID,NOME,IMMAGINE FROM CARTE ORDER BY RANDOM() LIMIT ?", num))
      .map(c => ({ ...c, flipped: true, attributi: [] }));
    const attributi = await dbAllAsync(this.db, "SELECT ID_CARD,ID_ATTR FROM ASS_CARD_ATTR");

    const attributiPerCarta = {};

    for (const a of attributi) {
      if (!attributiPerCarta[a.ID_CARD]) {
        attributiPerCarta[a.ID_CARD] = [];
      }
      attributiPerCarta[a.ID_CARD].push(a.ID_ATTR);
    }

    for (const card of cards) {
      if (attributiPerCarta[card.ID]) {
        card.attributi = attributiPerCarta[card.ID];
      }
    }

    const dataOdierna = dayjs().format('DD/MM/YYYY');

    let diff = '';
    if (num == 12) {
      diff = 'facile';
    } else if (num == 24) {
      diff = 'media';
    } else if (num == 36) {
      diff = 'difficile';
    }
   
    const punti = 0;
    const stato = 'pending';

    const idCardRandom = cards[Math.floor(Math.random() * cards.length)].ID;

    const insertQuery = "INSERT INTO PARTITE (ID_UTENTE, ID_CARD, DATA, DIFF, PUNTEGGIO, STATO) VALUES (?, ?, ?, ?, ?, ?)";
    const insertParams = [idUtente, idCardRandom, dataOdierna, diff, punti, stato];

    await dbRunAsync(this.db, insertQuery, insertParams);

    return cards;
  };

  this.getTipologie = async (cards) => {

    const cardIds = cards.map((card) => {
      if (card.flipped) {
        return card.ID;
      }
    });
    const Scards = JSON.stringify(cardIds);
    const senzaParentesi = Scards.slice(1, -1);
    const valoriTipologie = (await dbAllAsync(this.db, "SELECT DISTINCT ATTRIBUTI.TIPOLOGIA FROM attributi INNER JOIN ass_card_attr ON ATTRIBUTI.ID = ASS_CARD_ATTR.ID_ATTR WHERE ASS_CARD_ATTR.ID_CARD IN (" + senzaParentesi + ") GROUP BY ATTRIBUTI.TIPOLOGIA HAVING COUNT(DISTINCT ATTRIBUTI.VALORE) > 1;"));
    return valoriTipologie;
  };

  this.getHistory = async (idUtente) => {
    const history = (await dbAllAsync(this.db, "SELECT PARTITE.DATA,PARTITE.DIFF,CARTE.NOME,CARTE.IMMAGINE,PARTITE.PUNTEGGIO FROM PARTITE INNER JOIN CARTE ON PARTITE.ID_CARD=CARTE.ID WHERE PARTITE.ID_UTENTE = ? AND STATO = 'done' ", idUtente));
    return history;
  };

  this.getTotal = async (idUtente) => {
    const total = (await dbGetAsync(this.db, "SELECT SUM(PUNTEGGIO) AS TOT FROM PARTITE WHERE PARTITE.ID_UTENTE= ?", idUtente));
    return total;
  };


  this.getValuesFromTipologie = async (tipo, cards) => {

    const cardIds = cards.map((card) => {
      if (card.flipped) {
        return card.ID;
      }
    });
    const Scards = JSON.stringify(cardIds);
    const senzaParentesi = Scards.slice(1, -1);
    const valoriTipologie = (await dbAllAsync(this.db, "SELECT DISTINCT ATTRIBUTI.ID, ATTRIBUTI.VALORE FROM CARTE INNER JOIN ASS_CARD_ATTR ON CARTE.ID=ASS_CARD_ATTR.ID_CARD INNER JOIN ATTRIBUTI ON ATTRIBUTI.ID=ASS_CARD_ATTR.ID_ATTR WHERE ATTRIBUTI.TIPOLOGIA= ? and carte.ID in (" + senzaParentesi + ")", [tipo]));
    return valoriTipologie;
  };

  this.updateGame = async (punteggio,idUtente) => {
    const updateQuery = "UPDATE PARTITE SET PUNTEGGIO = ?, STATO = 'done' WHERE ID_UTENTE = ? and stato = 'pending'";
    const updateParams = [punteggio,idUtente];
    await dbRunAsync(this.db, updateQuery, updateParams);
  }


  this.ask = async (idUtente,value) => {
    const total = (await dbGetAsync(this.db, "SELECT COUNT(*) > 0 AS trovato FROM PARTITE INNER JOIN ASS_CARD_ATTR ON PARTITE.ID_CARD=ASS_CARD_ATTR.ID_CARD INNER JOIN ATTRIBUTI ON ASS_CARD_ATTR.ID_ATTR=ATTRIBUTI.ID WHERE PARTITE.STATO='pending' and PARTITE.ID_UTENTE = ? and ASS_CARD_ATTR.ID_ATTR = ?", [idUtente,value]));
    return total;
  };

  this.guess = async (idUtente) => {
    const total = (await dbGetAsync(this.db, "SELECT ID_CARD FROM PARTITE WHERE PARTITE.STATO='pending' and PARTITE.ID_UTENTE = ? ", idUtente));
    return total;
  };

  this.deletePending = async (idUtente) => {
    await dbRunAsync(this.db, "DELETE FROM PARTITE WHERE PARTITE.ID_UTENTE = ? AND STATO='pending'", idUtente);
  };






}


module.exports = Database;