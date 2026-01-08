const SERVER_HOST = "http://localhost";
const SERVER_PORT = 3001;

const SERVER_BASE = `${SERVER_HOST}:${SERVER_PORT}/api/`;

/**
 * Generic API call
 *
 * @param endpoint API endpoint string to fetch
 * @param method HTTP method
 * @param body HTTP request body string
 * @param headers additional HTTP headers to be passed to 'fetch'
 * @param expectResponse wheter to expect a non-empty response body
 * 
 * @returns whatever the specified API endpoint returns
 */

const APICall = async (endpoint, method = "GET", body = undefined, headers = undefined, expectResponse = true) => {
    let errors = [];

    try {
        const response = await fetch(new URL(endpoint, SERVER_BASE), {
            method,
            body,
            headers,
            credentials: "include"
        });

        if (response.ok) {
            if (expectResponse) return await response.json();
        }
        else errors = (await response.json()).errors;
    } catch {
        const err = ["Failed to contact the server"];
        throw err;
    }

    if (errors.length !== 0)
        throw errors;
};

//API che restituisce un numero definito di carte casuali ì
const fetchCards = async (num) => await APICall(`carte/${num}`);

//API che restituisce true se l'oggetto segreto possiede il valore di attributo passato e false altrimenti
const ask = async (val) => await APICall(
    "try",
    "POST",
    JSON.stringify({ val }),
    { "Content-Type": "application/json" },
    true
  );

//API che restituisce l'esito della partita e l'id della carta segreta
const guess = async (card,punti) => await APICall(
    "guess",
    "POST",
    JSON.stringify({ card,punti }),
    { "Content-Type": "application/json" },
    true
  );
//API utilizzata per ripulire le partite in pending di uno specifico utente
const clear = async () => await APICall(
    "clear",
    "DELETE",
    undefined,
    undefined,
    false
);
//API che restituisce lo storico delle partite di un utente specifico
const fetchHistory = async () => await APICall(`history`);

//API che restituisce i punti totali di un utente specifico
const getTotal = async () => await APICall(`history/total`);

//API che restituisce gli attributi presenti nelle carte estratte se essi presentano almeno 2 possibili valori
const fetchAttributes = async (cards) => await APICall(
    "attributi",
    "POST",
    JSON.stringify({cards}),
    { "Content-Type": "application/json" },
    true
  );

//API che restituisce i valori associabili ad un dato attributo e in base alle carte selezionate
const fetchValues = async (type, cards) => await APICall(
    "valori",
    "POST",
    JSON.stringify({ type, cards }),
    { "Content-Type": "application/json" },
    true
  );

/**
* Attempts to login the user
* 
* @param email email of the user
* @param password password of the user
*/
const login = async (email, password) => await APICall(
    "session",
    "POST",
    JSON.stringify({ username: email, password }),
    { "Content-Type": "application/json" }
);

/**
 * Logout.
 * This function can return a "Not authenticated" error if the user wasn't authenticated beforehand
 */
const logout = async () => await APICall(
    "session",
    "DELETE",
    undefined,
    undefined,
    false
);

const fetchCurrentUser = async () => await APICall("session/current");

const API = {
    fetchCards,
    fetchHistory,
    getTotal,
    fetchAttributes,
    fetchValues,
    login,
    logout,
    fetchCurrentUser,
    ask,
    guess,
    clear
};

export { API };