/* eslint-disable max-len */
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import Container from 'react-bootstrap/Container';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { BoxArrowUpRight, BoxArrowInRight, BoxArrowRight } from 'react-bootstrap-icons';
import SecondNavbar from '../SecondNavbar';

function getEditProfileUrl(email) {
  const slug = email.replace(/[*+~.()'"!:@]/g, '-');
  const editUrl = `/user/${slug}/editprofile`;
  return editUrl;
}

function Header({
  type,
  title,
  docView,
}) {
  const [session, loading] = useSession();
  const router = useRouter();
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
              {loading && (
                <Nav.Link disabled>Loading...</Nav.Link>
              )}
              {!session && !loading && (
                <Nav.Link href="/api/auth/signin" data-testid="nav-login-link" disabled={type === 'signin'}>
                  Log In
                  <BoxArrowInRight className="align-text-bottom ml-1" />
                </Nav.Link>
              )}
              {session && (
                <>
                  {session.user.name && (
                    <NavDropdown title={session.user.name} id="basic-nav-dropdown" data-testid="nav-profile-dropdown">
                      <NavDropdown.Item href={getEditProfileUrl(session.user.email)}>My Profile</NavDropdown.Item>
                      <NavDropdown.Item href="/api/auth/signout" data-testid="nav-login-link">
                        Log Out
                        <BoxArrowRight className="align-text-bottom ml-1" />
                      </NavDropdown.Item>
                    </NavDropdown>
                  )}
                  {!session.user.name && router.pathname !== '/user/newuser' && (
                    <Nav.Link href="/user/newuser" className="text-danger">
                      Complete Registration
                    </Nav.Link>
                  )}
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {session && !loading && (
        <SecondNavbar type={type} title={title} docView={docView} />
      )}
    </header>
  );
}

export default Header;
