import 'bootstrap-icons/font/bootstrap-icons.css';
import { Container, Button, ButtonGroup ,Spinner} from 'react-bootstrap';
import { useState } from 'react';
import React from 'react';
import { Grid } from './Grid';
import { GuessForm } from './GuessForm';
import './App.css';
import { GameResultModal } from './Utili';


function Homepage(props) {


  return (

    <Container fluid style={{ "paddingLeft": "2rem", "paddingRight": "2rem", "paddingBottom": "1rem", "marginTop": props.errorAlert ? "2rem" : "6rem" }}>
      <GameResultModal
        secCard={props.secCard}
        win={props.win}
        show={props.show}
        punti={props.size - props.mosse}
        restart={props.restart}
      />
      {props.carte.length === 0 && (
        <Container fluid style={{ "textAlign": "center", "paddingBottom": "1rem" }}>
          <Button variant="primary" size="lg" onClick={() => props.handlePlay(props.size)}>
            Gioca
          </Button>{' '}
          <ButtonGroup aria-label="Basic example">
            <Button
              variant={props.selectedOption === 'facile' ? 'success' : 'secondary'}
              onClick={() => props.handleOptionChange('facile', 12)}
            >
              Facile
            </Button>
            <Button
              variant={props.selectedOption === 'medio' ? 'warning' : 'secondary'}
              onClick={() => props.handleOptionChange('medio', 24)}
            >
              Medio
            </Button>
            <Button
              variant={props.selectedOption === 'difficile' ? 'danger' : 'secondary'}
              onClick={() => props.handleOptionChange('difficile', 36)}
            >
              Difficile
            </Button>
          </ButtonGroup>
        </Container>
      )}

      <Grid  gridS={props.size} carte={props.carte} updateSelectedCard={props.updateSelectedCard} selectedCard={props.selectedCard} />
      <GuessForm retriveAttributes={props.retriveAttributes} punti={props.size - props.mosse} selectedCard={props.selectedCard} carte={props.carte} size={props.size} valori={props.valori} attributi={props.attributi} caricaValori={props.caricaValori} question={props.question} guess={props.guess}></GuessForm>
      <ul><span><strong>  {
                props.retriveResponses === true ? 
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                    {" "}
                  </>
                : <div></div>
              } Domande effettuate:</strong></span>
      {Array.isArray(props.domande) && props.domande.map((domanda, index) => (
          <li key={index}>
            
            {domanda.risposta == true ? (
              <span style={{ color: "green" }}> {domanda.domanda}</span>
            ) : (
              <span style={{ color: "red" }}> {domanda.domanda}</span>
            )}
          </li>
        ))}
      </ul>

    </Container>
  );
}

export {
  Homepage
};