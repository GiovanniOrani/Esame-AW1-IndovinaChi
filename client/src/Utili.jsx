import { Alert, Container, Nav, Navbar, Modal, Button,Image} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

function NotFoundPage() {
  return (
    <>
      <div style={{ "textAlign": "center", "paddingTop": "5rem" }}>
        <h1>
          <i className="bi bi-exclamation-circle-fill" />
          {" "}
          The page cannot be found
          {" "}
          <i className="bi bi-exclamation-circle-fill" />
        </h1>
        <br />
        <p>
          The requested page does not exist, please head back to the <Link to={"/"}>app</Link>.
        </p>
      </div>
    </>
  );
}

function MyNavbar(props) {
  const navigate = useNavigate();
  return (
    <>
      <Navbar className="shadow" fixed="top" bg="light" style={{ "marginBottom": "2rem", "background": "gray" }}>
        <Container>
          <Navbar.Brand style={{ "fontSize": "2rem", "fontWeight": "bold" }} href="/" onClick={event => { event.preventDefault(); navigate("/"); }}>
            {" Indovina Chi"}
          </Navbar.Brand>
          <Nav>
            {
              props.utente ?
                <>
                  <Nav.Link href="/history" onClick={event => { event.preventDefault(); navigate("/history"); }}><strong>Storico partite </strong></Nav.Link>
                  <Navbar.Text>
                    <strong>|| </strong>Benvenuto! : <b>{props.utente.username}</b> | <a href="/logout" onClick={event => { event.preventDefault(); navigate("/"); props.logoutCbk(); }}>Logout</a>
                  </Navbar.Text>

                </>
                :
                <Nav.Link href="/login" active={false} style={{ "color": "blue", "fontSize": "1.2rem" }} onMouseEnter={e => e.target.style.borderBottom = "1px solid blue"} onMouseLeave={e => e.target.style.borderBottom = "1px solid transparent"} onClick={event => { event.preventDefault(); navigate("/login"); }}>
                  Login
                  {" "}
                  <i className="bi bi-person-fill" />
                </Nav.Link>
            }
          </Nav>
        </Container>
      </Navbar>
    </>
  );
}

function GameResultModal(props) {
  return (
    <Modal show={props.show}>
      <Modal.Header>
        <Modal.Title><strong> {props.win ? "HAI VINTO!" : "HAI PERSO"}</strong></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <strong>Punti: {props.win && props.punti > 0 ? props.punti : 0}</strong>
        {props.secCard ? (
          <div>
            <strong>Carta segreta: {props.secCard.NOME}</strong>
            <Image style={{ "width": "inherit" }} src={`http://localhost:3001/img/${props.secCard.IMMAGINE}.png`} />
          </div>
        ) :
        <div></div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => { props.restart(); }}>
          RIGIOCA
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

function ErrorsAlert(props) {
  return (
    <Alert variant="danger" dismissible onClose={props.clear} style={{ "margin": "2rem", "marginTop": "6rem" }}>
      {props.errors.length === 1 ? props.errors[0] : ["Errors: ", <br key="br" />, <ul key="ul">
        {
          props.errors.map((e, i) => <li key={i + ""}>{e}</li>)
        }
      </ul>]}
    </Alert>
  );
}

export {
  MyNavbar,
  NotFoundPage,
  ErrorsAlert,
  GameResultModal
};