import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useNavigate } from 'react-router-dom';
import { ErrorsAlert, MyNavbar, NotFoundPage } from './Utili';
import { Spinner } from 'react-bootstrap';
import { API } from './API';
import { Login } from './Login';
import { Homepage } from './Home';
import { History } from './History';

function App() {
  return (
    <BrowserRouter>
      <Main />
    </BrowserRouter>
  );
}

/**
 * The actual main app.
 * This is used instead of the default App component because Main can be encapsulated in
 * a BrowserRouter component, giving it the possibility of using the useNavigate hook.
 */
function Main() {
  const navigate = useNavigate();
  const [carte, setCarte] = useState([]);//stato per salvare le carte estratte
  const [attributi, setAttributi] = useState([]);//stato per salvare gli attributi estratti
  const [valori, setValori] = useState([]);//stato per salavare i valori estratti
  const [mosse, setMosse] = useState(0);//stato per tenere il conto delle mosse effettuate
  const [selectedCard, setSelectedCard] = useState(null);//stato per tenere traccia della carta selezionata dall'utente
  const [secretCard,setSecretCard]=useState(undefined);//stato per salvare la carta segreta a fine partita
  const [utente, setUtente] = useState(undefined);//stato per salvare l'utente loggato
  const [loading, setLoading] = useState(true);//stato usato per attivare lo spinner di caricamento
  const [errors, setErrors] = useState([]);//stato usato per salvare gli errori
  const [showModal, setShowModal] = useState(false);//stato per visualizzare o meno il modale di fine partita
  const [win, setWin] = useState(undefined);//stato per salvare l'esito della partita
  const [domande, setDomande] = useState([]);//stato per salavare le domande effettuate durante la partita
  const [partite, setPartite] = useState([]);//stato per salvare le partite effettuate dall'utente
  const [totale, setTotale] = useState([]);//stato per salavre il punteggio totale dell'utente
  const [retriveAttributes,setRetriveAttributes] = useState(false);//stato usato per colorare le select di rosso mentre si stanno popolando
  const [retriveResponses,setRetriveResponses] = useState(false);//stato usato per attivare uno spinner mentre si processano le domande 
  const [selectedOption, setSelectedOption] = useState('facile');//stato per salvare la scelta di difficoltà effettuata
  const [size, setSize] = useState(12);//stato usato per salavre il numero di carte della difficoltà selezionata

  const handleOptionChange = (option, newSize) => {
    setSelectedOption(option);
    setSize(newSize);
  };

  useEffect(() => {
    
    if (carte && carte.length > 1) {
      setRetriveAttributes(true);

      API.fetchAttributes(carte)
        .then(res => {
          setAttributi(res.attributi);
        })
        .catch(err => setErrors(err))
        .finally(()=>setRetriveAttributes(false));
    }
  }, [carte]);

  useEffect(() => {
    setLoading(true);
    API.fetchCurrentUser()
      .then(user => {
        setUtente(user);
      })
      .catch(err => {
        // Remove eventual 401 Unauthorized errors from the list, those are expected
        setErrors(err.filter(e => e !== "Not authenticated"));
      })
      .finally(() => {
        // Loading done
        setLoading(false);
      });

  }, []);

  const updateSelectedCard = async (selCard) => {
    setSelectedCard(selCard);
  }

  const handlePlay = async (num) => {
    setLoading(true);
    API.fetchCards(num)
      .then(res => {
        const cardsData = res.cards;
        setCarte(cardsData);
      })
      .catch(err => setErrors(err))
      .finally(()=>setLoading(false));


  };

  const getHistory = async () => {
    setLoading(true);
    Promise.all([API.getTotal(), API.fetchHistory()])
            .then(res => {
                const total = res[0].total;
                const history = res[1].history;
                setTotale(total);
                setPartite(history);
            })
            .catch(err => {
                setErrors(err);        
            })
            .finally(()=>setLoading(false));
  };


  const question = async (val,attr,valore) => {
    setRetriveResponses(true);
    API.ask(val)
      .then(res => {

        if (res) {
          const carteFiltrate = carte.map(carta => ({
            ...carta,
            flipped: carta.attributi.find(x => x == val) ? carta.flipped : false,
          }));
          setCarte(carteFiltrate);
          let risp={domanda:""+ attr +"="+ valore +" ---> esatto", risposta:true};
          setDomande(domande => [...domande, risp]);
        } else {
          const carteFiltrate = carte.map(carta => ({
            ...carta,
            flipped: carta.attributi.find(x => x == val) ? false : carta.flipped,
          }));
          setCarte(carteFiltrate);
          let risp={domanda:""+ attr +"="+ valore +"---> errato", risposta:false};
          setDomande(domande => [...domande, risp]);
        }
        setMosse((m) => m + 1);

      })
      .catch(err => setErrors(err))
      .finally(()=>setRetriveResponses(false));
  };

  const guess = async (card, punti) => {
    setLoading(true);
    API.guess(card, punti)
      .then(res => {
        const secCard= carte.find(carta => carta.ID === res[1]);
        setSecretCard(secCard);
        if (res[0]) {
          setShowModal(true);
          setWin(true);
        } else {
          setShowModal(true);
          setWin(false);
        }

      })
      .catch(err => setErrors(err))
      .finally(()=>setLoading(false));
  };

  const caricaValori = async (attributo, cards) => {
    setRetriveAttributes(true);
    API.fetchValues(attributo, cards)
      .then(res => {
        const valori = res.valori;
        setValori(valori);
      })
      .catch(err => setErrors(err))
      .finally(()=>setRetriveAttributes(false));
  };

  const restart = async () => {
    setCarte([]);
    setAttributi([]);
    setDomande([]);
    setSelectedCard(null);
    setSecretCard(undefined);
    setValori([]);
    setSize(12);
    setSelectedOption('facile');
    setWin(undefined);
    setMosse(0);
    setShowModal(false);
  };

  const login = (email, password, onFinish) => {
    API.login(email, password)
      .then((res) => {
        setLoading(true);
        setErrors([]);
        restart();
        setUtente(res);
      })
      .then(() => navigate("/"))
      .catch(err => setErrors(err))
      .finally(() => { onFinish?.(); setLoading(false); });
  };

  const logout = () => {
    API.logout()
      .then(() => {
        setUtente(undefined);
      })
      .catch(err => {
        // Remove eventual 401 Unauthorized errors from the list
        setErrors(err.filter(e => e !== "Not authenticated"));
      })
      .finally(() => {
        // Loading done
        restart();
        setLoading(false);
        navigate("/");
      });
  };


  return (
    <Routes>
      <Route path="/" element={<Header utente={utente} logoutCbk={logout} errors={errors} clearErrors={() => setErrors([])}  />}>
        <Route path="" element={loading ? <LoadingSpinner /> : <Homepage handleOptionChange={handleOptionChange} size={size} selectedOption={selectedOption} retriveAttributes={retriveAttributes} retriveResponses={retriveResponses} secCard={secretCard} domande={domande} win={win} show={showModal} mosse={mosse} selectedCard={selectedCard} utente={utente} carte={carte} valori={valori} attributi={attributi} handlePlay={handlePlay} caricaValori={caricaValori} question={question} updateSelectedCard={updateSelectedCard} guess={guess} restart={restart} errorAlert={errors.length > 0} />} />
        <Route path="login" element={loading ? <LoadingSpinner /> : <Login loginCbk={login} errorAlert={errors.length > 0}/>} />
        <Route path="history" element={loading ? <LoadingSpinner /> : <History utente={utente} partite={partite} totale={totale} getHistory={getHistory}  errorAlert={errors.length > 0}/>} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}



/**
 * Header of the page, containing the navbar and, potentially, the error alert
 * 
 * @param props.utente 
 * @param props.logoutCbk 
 */
function Header(props) {
  return (
    <>
      <MyNavbar utente={props.utente} logoutCbk={props.logoutCbk} />
        {
          props.errors.length > 0 ? <ErrorsAlert errors={props.errors} clear={props.clearErrors} /> : false
        }
      <Outlet />
    </>
  );
}


//loading spinner
function LoadingSpinner() {
  return (
    <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
}

export default App
