/* eslint-disable max-len */
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Container from 'react-bootstrap/Container';
import {
  Nav, Navbar, NavDropdown, Dropdown, ButtonGroup, DropdownButton,
} from 'react-bootstrap';
import {
  BoxArrowUpRight, BoxArrowInRight, BoxArrowRight, GearWideConnected, List,
} from 'react-bootstrap-icons';
import SecondNavbar from '../SecondNavbar';
import FeedbackButton from '../FeedbackButton';
import { appendProtocolIfMissing } from '../../utils/fetchUtil';
import styles from './Header.module.scss';
import { useWindowSize } from '../../utils/customHooks';
import FeedbackModal from '../FeedbackButton/FeedbackModal';

const getEditProfileUrl = (email) => {
  const slug = email.replace(/[*+~.()'"!:@]/g, '-');
  const editUrl = `/user/${slug}/editprofile`;
  return editUrl;
};

const Header = ({
  type,
  breadcrumbs,
  getTextAnalysisData,
  document,
  docView,
  annotations,
  newReg,
  statefulSession,
  dashboardState,
  mode,
  setMode,
  borderBottom,
  secondNavbarExtraContent,
}) => {
  const { data: session, status } = useSession();
  const [modalShow, setModalShow] = useState();
  const windowSize = useWindowSize();
  const router = useRouter();
  const loading = status === 'loading';

  const navbarItems = windowSize.width >= 800
    ? (
      <>
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
        <Nav.Link href={`/api/auth/signin?callbackUrl=${appendProtocolIfMissing(process.env.SITE)}`} data-testid="nav-login-link" disabled={type === 'signin'}>
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
      </>
    )
    : (
      <>
        <DropdownButton
          as={ButtonGroup}
          key="hello-goodbye"
          id="hello-goodbye"
          drop="down"
          variant="secondary"
          title={<List size={20} color="white" />}
          className={styles.menuButton}
          onSelect={(eventKey) => {
            switch (eventKey) {
              case 'my-profile':
                router.push({
                  pathname: getEditProfileUrl(session.user.email),
                });
                break;
              case 'help':
                router.push({
                  pathname: 'https://support.annotationstudio.org',
                });
                break;
              case 'login':
                router.push({
                  pathname: '/api/auth/signin',
                  query: {
                    callbackUrl: appendProtocolIfMissing(process.env.SITE),
                  },
                });
                break;
              case 'logout':
                router.push({
                  pathname: '/api/auth/signout',
                });
                break;
              case 'complete-registration':
                router.push({
                  pathname: '/user/newuser',
                });
                break;
              case 'refresh-page':
                router.reload();
                break;
              case 'administration':
                router.push({
                  pathname: '/admin',
                });
                break;
              case 'feedback':
                setModalShow(true);
                break;
              default:
                // code block
            }
          }}
        >
          <Dropdown.Item eventKey="feedback">
            Feedback
          </Dropdown.Item>
          <Dropdown.Item eventKey="help">
            Help
          </Dropdown.Item>
          {!session && !loading && (
          <Dropdown.Item eventKey="login">
            Log In
          </Dropdown.Item>
          )}
          {session && (
          <>
            {session.user.role === 'admin' && (
            <Dropdown.Item eventKey="administration">
              Administration
            </Dropdown.Item>
            )}
            {((statefulSession && statefulSession.user && statefulSession.user.email)
              || (!statefulSession && session.user.firstName))
              && (
              <Dropdown.Item eventKey="my-profile">
                My Profile
              </Dropdown.Item>
              )}
            {!newReg && !session.user.firstName && !(statefulSession && statefulSession.user && statefulSession.user.email) && router.pathname !== '/user/newuser' && (
            <Dropdown.Item eventKey="complete-registration">
              Complete Registration
            </Dropdown.Item>
            )}
            {newReg && !session.user.firstName && !statefulSession && (
              <Dropdown.Item eventKey="refresh-page">
                Refresh this page
              </Dropdown.Item>
            )}
          </>
          )}
          {statefulSession && statefulSession.user && statefulSession.user.email && (
            <>
              <Dropdown.Divider />
              <Dropdown.Item eventKey="logout">Log Out</Dropdown.Item>
            </>
          )}
          {!statefulSession && session?.user.firstName && (
            <>
              <Dropdown.Divider />
              <Dropdown.Item eventKey="logout">Log Out</Dropdown.Item>
            </>
          )}
        </DropdownButton>
      </>
    );

  return (
    <header className={`as-header ${styles.header}`} sticky="top">
      <Navbar bg="dark" variant="dark" className="px-0">
        <Container
          fluid
          className={[windowSize.smallerThanOrEqual.isTabletOrMobile ? styles.mobileView : '', 'px-5'].join(' ')}
          style={{ transition: 'padding 0.5s' }}
        >
          <Navbar.Brand href="/">
            {process.env.NEXT_PUBLIC_LOGO_SVG && (
              <img
                className={styles.headerlogo}
                src={`/${process.env.NEXT_PUBLIC_LOGO_SVG}`}
                alt="logo"
              />
            )}
            {process.env.NEXT_PUBLIC_SITE_NAME || 'Annotation Studio'}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              {navbarItems}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {session && !loading && (
        <SecondNavbar
          session={session}
          type={type}
          breadcrumbs={breadcrumbs}
          getTextAnalysisData={getTextAnalysisData}
          document={document}
          docView={docView}
          annotations={annotations}
          dashboardState={dashboardState}
          mode={mode}
          setMode={setMode}
          borderBottom={borderBottom}
          extraContent={secondNavbarExtraContent}
          windowSize={windowSize}
        />
      )}
      <FeedbackModal
        show={modalShow}
        setShow={setModalShow}
        session={session}
      />
    </header>
  );
};

export default Header;
