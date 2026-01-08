import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const GuessForm = (props) => {
  const [selectedAttributo, setSelectedAttributo] = useState(0); // Stato per l'attributo selezionato
  const [selectedValore, setSelectedValore] = useState(0); // Stato per il valore selezionato
  const [selectedValoreText, setSelectedValoreText] = useState(""); // Stato per il testo del valore selezionato
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // Stato per abilitare/disabilitare il pulsante "Chiedi"



  // Esegue il caricamento dei valori associabili quando l'attributo viene selezionato
  useEffect(() => {

    if (selectedAttributo) {
      props.caricaValori(selectedAttributo, props.carte);
    }
  }, [selectedAttributo]);

  // Abilita o disabilita il pulsante "Chiedi" se il valore è selezionato
  useEffect(() => {
    if (selectedValore) {
      setIsButtonDisabled(selectedValore === 0);
    }

  }, [selectedValore]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ marginTop: '10px' }}>
        <Button variant="danger" disabled={props.selectedCard === null} onClick={()=>{props.guess(props.selectedCard,props.punti);}}>
          INDOVINA!
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '10px' }}>
        <Form style={{ marginRight: '10px', flex: 1 }}>
          <Form.Group controlId="attributoSelect">
            <Form.Control as="select" value={selectedAttributo} onChange={(e) => setSelectedAttributo(e.target.value)} disabled={props.attributi.length === 0} style={{ width: '250px', backgroundColor: props.retriveAttributes === true ? '#eda1b3' : '',}}>
              <option value="">Seleziona un attributo</option>
              {props.attributi.map((attributo) => (
                <option key={attributo.TIPOLOGIA} value={attributo.TIPOLOGIA}>
                  {attributo.TIPOLOGIA}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>

        <Form style={{ marginRight: '10px', flex: 1 }}>
          <Form.Group controlId="valoreSelect">
            <Form.Control as="select" value={selectedValore} onChange={(e) => {setSelectedValore(e.target.value); setSelectedValoreText(e.target.options[e.target.selectedIndex].textContent)}}
              disabled={selectedAttributo === 0 || props.valori.length === 0}
              style={{ width: '250px', backgroundColor: props.retriveAttributes === true ? '#eda1b3' : '',}}
            >
              <option value="">Seleziona un valore associabile</option>
              {props.valori.map((valore) => (
                <option key={valore.ID} value={valore.ID}>
                  {valore.VALORE}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </Form>

        <Button variant="primary" onClick={() => { props.question(selectedValore,selectedAttributo,selectedValoreText); setSelectedValore(0); setSelectedAttributo(0) }} disabled={isButtonDisabled}>
          Chiedi
        </Button>
      </div>
    </div>




  );
};

export { GuessForm };
