import React from 'react';
import './grid.css'; // Stile per la griglia
import { Image } from 'react-bootstrap';

const Grid = (props) => {

    const cards = Array.from({ length: props.gridS }).map((_, index) => (
        
        props.carte[index] && props.carte[index].flipped ?
        <div key={index}  className={`${props.selectedCard === props.carte[index].ID ? 'cards flipped selected' : 'cards flipped'}`}
        onClick={() => {
            if(props.selectedCard === props.carte[index].ID){
                props.updateSelectedCard(null);
            }else{
                props.updateSelectedCard(props.carte[index].ID);
            }
            
          }}>
                <Image style={{ "width": "inherit"}}src={`http://localhost:3001/img/${props.carte[index].IMMAGINE}.png`} alt={props.carte[index].NOME} />
        </div>
        :
        <div key={index} className="cards notFlipped">          
                <i className="bi bi-question-lg backIcon"></i>
        </div>
    ));

    return <div className="grid-container">{cards}</div>;
};
export { Grid }; 