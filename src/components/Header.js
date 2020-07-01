import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { BoxArrowUpRight, BoxArrowInRight } from 'react-bootstrap-icons';

function Header() {
  return (
    <header sticky="top">
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">Annotation Studio</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <NavDropdown title="About" id="basic-nav-dropdown" data-testid="nav-about-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="#help" data-testid="nav-help-link">
                Help
                <BoxArrowUpRight className="align-text-bottom ml-1" />
              </Nav.Link>
              <Nav.Link href="#login" data-testid="nav-login-link">
                Log In
                <BoxArrowInRight className="align-text-bottom ml-1" />
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;