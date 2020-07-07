import { useSession } from 'next-auth/client';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { BoxArrowUpRight, BoxArrowInRight, BoxArrowRight } from 'react-bootstrap-icons';

function Header() {
  const [session] = useSession();
  return (
    <header sticky="top">
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="/">Annotation Studio</Navbar.Brand>
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
              {!session && (
                <Nav.Link href="/api/auth/signin" data-testid="nav-login-link">
                  Log In
                  <BoxArrowInRight className="align-text-bottom ml-1" />
                </Nav.Link>
              )}
              {session && (
                <>
                  {session.user.name && (
                    <Nav.Link eventKey="disabled" disabled>
                      {session.user.name}
                      {' '}
                    </Nav.Link>
                  )}
                  <Nav.Link href="/api/auth/signout" data-testid="nav-login-link">
                    Log Out
                    <BoxArrowRight className="align-text-bottom ml-1" />
                  </Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}

export default Header;
