import { useState } from "react";
import { Button, Card, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import validator from "validator";

function Login(props) {
    const [email, setEmail] = useState("giovanni@gmail.com");
    const [password, setPassword] = useState("pass");
  
    const [emailError, setEmailError] = useState("");
    const [passwordValid, setPasswordValid] = useState(true);
  
    const [waiting, setWaiting] = useState(false);
  
    const handleSubmit = event => {
      event.preventDefault();
  
      // Validate form
      const trimmedEmail = email.trim();
      const emailError = validator.isEmpty(trimmedEmail) ? "Email must not be empty" : (
        !validator.isEmail(trimmedEmail) ? "Not a valid email" : ""
      );
      const passwordValid = !validator.isEmpty(password);
  
      if (!emailError && passwordValid) {
        setWaiting(true);
        props.loginCbk(email, password, () => {setWaiting(false)});
      } else {
        setEmailError(emailError);
        setPasswordValid(passwordValid);
      }
    };
  
    return (
      <Container fluid style={{"marginTop": props.errorAlert ? "2rem" : "6rem"}}>
      <Row className="justify-content-evenly">
      <Col md="3" style={{"paddingLeft": "3rem"}}>
        <Link to="/" className="btn btn-outline-secondary"><i className="bi bi-arrow-left"/>INDIETRO</Link>
      </Col>
      <Col style={{"maxWidth": "50rem", "minWidth": "30rem"}}>
      <Card>
        <Card.Header as="h2">Login</Card.Header>
        <Container style={{"marginTop": "0.5rem", "padding": "1rem"}}>
          <Form noValidate onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Email</Form.Label>
                <Form.Control isInvalid={!!emailError}
                              type="email"
                              placeholder="mail@provider.com"
                              value={email}
                              autoFocus
                              onChange={event => {setEmail(event.target.value); setEmailError("");}}/>
                <Form.Control.Feedback type="invalid">
                  {emailError}
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Password</Form.Label>
                <Form.Control isInvalid={!passwordValid}
                              type="password"
                              placeholder="Password"
                              value={password}
                              onChange={event => {setPassword(event.target.value); setPasswordValid(true);}}/>
                <Form.Control.Feedback type="invalid">
                  Password must not be empty
                </Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Button type="submit" disabled={waiting}>
              {
                waiting ? 
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"/>
                    {" "}
                  </>
                : false
              }
              Login
            </Button>
          </Form>
        </Container>
      </Card>
      </Col>
      <Col md="3"/>
      </Row>
      </Container>
    );
  }
  
  export { Login };