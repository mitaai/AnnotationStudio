/* eslint-disable max-len */
import React from 'react';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import Container from 'react-bootstrap/Container';
import { Nav, Navbar, NavDropdown } from 'react-bootstrap';
import {
  BoxArrowUpRight, BoxArrowInRight, BoxArrowRight, GearWideConnected,
} from 'react-bootstrap-icons';
import SecondNavbar from '../SecondNavbar';
import FeedbackButton from '../FeedbackButton';

function getEditProfileUrl(email) {
  const slug = email.replace(/[*+~.()'"!:@]/g, '-');
  const editUrl = `/user/${slug}/editprofile`;
  return editUrl;
}

function Header({
  type,
  document,
  docView,
  annotations,
  newReg,
  statefulSession,
}) {
  const [session, loading] = useSession();
  const router = useRouter();
  return (
    <header sticky="top" style={{ zIndex: 2 }}>
      <Navbar bg="dark" variant="dark" className="px-0">
        <Container fluid className="px-5">
          <Navbar.Brand href="/">Annotation Studio</Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              <FeedbackButton session={session} />
              <NavDropdown title="About" id="basic-nav-dropdown" data-testid="nav-about-dropdown">
                <NavDropdown.Item href="https://www.annotationstudio.org/project/">Project</NavDropdown.Item>
                <NavDropdown.Item href="https://www.annotationstudio.org/pedagogy/">Pedagogy</NavDropdown.Item>
                <NavDropdown.Item href="https://www.annotationstudio.org/community/">Community</NavDropdown.Item>
              </NavDropdown>
              <Nav.Link href="https://support.annotationstudio.org" data-testid="nav-help-link">
                Help
                <BoxArrowUpRight className="align-text-bottom ml-1" />
              </Nav.Link>
              {loading && (
                <Nav.Link disabled>Loading...</Nav.Link>
              )}
              {!session && !loading && (
                <Nav.Link href={`/api/auth/signin?callbackUrl=${process.env.SITE}`} data-testid="nav-login-link" disabled={type === 'signin'}>
                  Log In
                  <BoxArrowInRight className="align-text-bottom ml-1" />
                </Nav.Link>
              )}
              {session && (
                <>
                  {session.user.role === 'admin' && (
                    <Nav.Link href="/admin">
                      Administration
                      <GearWideConnected className="align-text-bottom ml-1" />
                    </Nav.Link>
                  )}
                  {statefulSession && statefulSession.user && statefulSession.user.email && (
                    <NavDropdown title={statefulSession.user.name} id="basic-nav-dropdown" data-testid="nav-profile-dropdown">
                      <NavDropdown.Item href={getEditProfileUrl(statefulSession.user.email)}>My Profile</NavDropdown.Item>
                      <NavDropdown.Item href="/api/auth/signout" data-testid="nav-login-link">
                        Log Out
                        <BoxArrowRight className="align-text-bottom ml-1" />
                      </NavDropdown.Item>
                    </NavDropdown>
                  )}
                  {!statefulSession && session.user.firstName && (
                    <NavDropdown title={session.user.name} id="basic-nav-dropdown" data-testid="nav-profile-dropdown">
                      <NavDropdown.Item href={getEditProfileUrl(session.user.email)}>My Profile</NavDropdown.Item>
                      <NavDropdown.Item href="/api/auth/signout" data-testid="nav-login-link">
                        Log Out
                        <BoxArrowRight className="align-text-bottom ml-1" />
                      </NavDropdown.Item>
                    </NavDropdown>
                  )}
                  {!newReg && !session.user.firstName && !(statefulSession && statefulSession.user && statefulSession.user.email) && router.pathname !== '/user/newuser' && (
                    <Nav.Link href="/user/newuser" className="text-danger">
                      Complete Registration
                    </Nav.Link>
                  )}
                  {newReg && !session.user.firstName && !statefulSession && (
                    <Nav.Link onClick={() => router.reload()} className="text-warning">Refresh this page</Nav.Link>
                  )}
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {session && !loading && (
        <SecondNavbar session={session} type={type} document={document} docView={docView} annotations={annotations} />
      )}
    </header>
  );
}

export default Header;
