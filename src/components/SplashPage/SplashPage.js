import {
  Button, Container, Row, Col, Image, Nav,
} from 'react-bootstrap';
import { ArrowRightShort } from 'react-bootstrap-icons';
import { appendProtocolIfMissing } from '../../utils/fetchUtil';

export default function SplashPage() {
  return (
    <Container style={{ marginBottom: 60 }}>
      <Row>
        <Col
          xs={12}
          sm={12}
          md={4}
          style={{
            justifyContent: 'center',
            display: 'flex',
            flexDirection: 'column',
            marginTop: -10,
          }}
        >
          <Row>
            <Col style={{ fontSize: 36, fontFamily: 'Arial', marginBottom: 10 }}>
              <div>Welcome to</div>
              <div>Annotation Studio</div>
              <span style={{ fontSize: 16, borderRadius: 5, backgroundColor: '#F5CE49', color: '#424242', padding: '5px 10px' }}>BETA Version</span>
            </Col>
          </Row>
          <Row>
            <Col style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 16, color: '#768399', lineHeight: '28px' }}>
                Annotation Studio supports and connects collaborative annotation, source-based composition, and in-depth review in a flexible, web-based environment
              </span>
            </Col>
          </Row>
          <Row style={{ paddingTop: 10, paddingBottom: 10 }}>
            <Col>
              <Nav.Link
                style={{ display: 'inline' }}
                as={Button}
                href={`/api/auth/signin?callbackUrl=${appendProtocolIfMissing(process.env.SITE)}`}
              >
                <span>Log In / Sign Up</span>
                <ArrowRightShort size={22} style={{ position: 'relative', left: 2, top: -1 }} />
              </Nav.Link>
            </Col>
          </Row>
        </Col>
        <Col xs={12} sm={12} md={8}>
          <div style={{
            width: '100%',
            minHeight: 430,
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 40,
          }}
          >
            <Image src="/splashpage2.svg" alt="Annotation Studio" fluid />
          </div>
        </Col>
      </Row>
      <Row>
        <Col style={{ marginTop: 30 }} xs={12} sm={6} md={3}>
          <Row>
            <Col style={{ marginBottom: 15, display: 'flex', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>Read</span>
            </Col>
          </Row>
          <Row style={{ marginTop: -27 }}>
            <Col style={{ padding: '0px 34% 0px 16%', marginBottom: 20, minHeight: 100 }}>
              <Image
                style={{
                  position: 'relative',
                  left: 15,
                }}
                src="/splashpagepic2.svg"
                alt="Read"
                fluid
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <span style={{ fontSize: 16 }}>
                Engage more deeply and reflect more critically upon texts through close reading
              </span>
            </Col>
          </Row>
        </Col>
        <Col style={{ marginTop: 30 }} xs={12} sm={6} md={3}>
          <Row>
            <Col style={{ marginBottom: 15, display: 'flex', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>Annotate</span>
            </Col>
          </Row>
          <Row style={{ marginTop: 10 }}>
            <Col style={{ padding: '0px 34% 0px 16%', marginBottom: 20, minHeight: 100 }}>
              <Image
                style={{
                  position: 'relative',
                  left: 15,
                }}
                src="/splashpagepic4.svg"
                alt="Annotate"
                fluid
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <span style={{ fontSize: 16 }}>
                Extend the millennia old humanistic tradition of writing in the margins to digital texts and media
              </span>
            </Col>
          </Row>
        </Col>
        <Col style={{ marginTop: 30 }} xs={12} sm={6} md={3}>
          <Row>
            <Col style={{ marginBottom: 15, display: 'flex', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>Collaborate</span>
            </Col>
          </Row>
          <Row>
            <Col style={{ padding: '0% 25%', marginBottom: 20, minHeight: 100 }}>
              <Image src="/splashpagepic3.svg" alt="Collaborate" fluid />
            </Col>
          </Row>
          <Row>
            <Col>
              <span style={{ fontSize: 16 }}>
                Share your insights with others, create reading groups, and build a library of texts for education, research, and more
              </span>
            </Col>
          </Row>
        </Col>
        <Col style={{ marginTop: 30 }} xs={12} sm={6} md={3}>
          <Row>
            <Col style={{ marginBottom: 15, display: 'flex', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>Compose</span>
            </Col>
          </Row>
          <Row style={{ marginTop: -27 }}>
            <Col style={{ padding: '0px 20% 0px 16%', marginBottom: 20, minHeight: 100 }}>
              <Image
                style={{
                  position: 'relative',
                  left: -8,
                }}
                src="/splashpagepic1.svg"
                alt="Compose"
                fluid
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <span style={{ fontSize: 16 }}>
                Use your annotations to engage in the entire writing process, from initial reading to brainstorming, writing, and review
              </span>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
