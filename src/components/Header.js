import { useSession } from 'next-auth/client';
import Container from 'react-bootstrap/Container';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BoxArrowUpRight, BoxArrowInRight, BoxArrowRight } from 'react-bootstrap-icons';
import SecondNavbar from './SecondNavbar';

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
                    <NavDropdown title={session.user.name} id="basic-nav-dropdown" data-testid="nav-profile-dropdown">
                      <NavDropdown.Item href="#editprofile">My Profile</NavDropdown.Item>
                      <NavDropdown.Item href="/api/auth/signout" data-testid="nav-login-link">
                        Log Out
                        <BoxArrowRight className="align-text-bottom ml-1" />
                      </NavDropdown.Item>
                    </NavDropdown>
                  )}
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {session && (
        <SecondNavbar />
      )}
    </header>
  );
}

export default Header;
