import 'bootstrap-icons/font/bootstrap-icons.css';
import { Container, Row, Col, Table,Image } from 'react-bootstrap';
import { useEffect } from 'react';
import React from 'react';
import './App.css';



function History(props) {


    useEffect(() => {  
            props.getHistory();
    }, []);

    return (
        <Container fluid style={{ "paddingLeft": "2rem", "paddingRight": "2rem", "paddingBottom": "1rem", "marginTop": props.errorAlert ? "200rem" : "6rem" }}>
            <Row className="justify-content-center mt-5">
                <Col md={6}>
                    <div className="text-center">
                        <i className="bi bi-trophy-fill"></i>
                        <span className="ml-2"><strong>Punteggio totale:</strong> <strong>{props.totale}</strong></span>
                    </div>
                </Col>
            </Row>
            <Row className="mt-5">
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Difficoltà</th>
                                <th>Carta segreta</th>
                                <th>Punteggio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(props.partite) ? (
                                props.partite.map((partita, index) => (
                                    <tr key={index}>
                                        <td>{partita.DATA}</td>
                                        <td>{partita.DIFF}</td>
                                        <td>{partita.NOME} <Image style={{ "width": "8rem" }} src={`http://localhost:3001/img/${partita.IMMAGINE}.png`} /></td>
                                        <td>{partita.PUNTEGGIO}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4">Nessuna partita trovata.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
}

export {
    History
};