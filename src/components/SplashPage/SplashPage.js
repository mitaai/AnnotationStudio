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
            </Col>
          </Row>
          <Row>
            <Col style={{ marginBottom: 20 }}>
              <span style={{ fontSize: 16, color: '#768399', lineHeight: '28px' }}>
                Facilitating the reading and writing process by giving students and teachers
                tools to collaboratively annotate literary documents
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
        <Col style={{ marginTop: 30 }} xs={12} sm={12} md={4}>
          <Row>
            <Col style={{ marginBottom: 5, display: 'flex', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>Collaboration</span>
            </Col>
          </Row>
          <Row>
            <Col style={{ padding: '0% 25%', marginBottom: 20, minHeight: 100 }}>
              <Image src="/splashpagepic3.svg" alt="picture 1" fluid />
            </Col>
          </Row>
          <Row>
            <Col>
              <span>
                Landkit is built to make  your life easier.. Variables, build tooling,
                documentation, and reusable components
              </span>
            </Col>
          </Row>
        </Col>
        <Col style={{ marginTop: 30 }} xs={12} sm={12} md={4}>
          <Row>
            <Col style={{ marginBottom: 5, display: 'flex', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>Close Reading</span>
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
                alt="picture 1"
                fluid
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <span>
                Landkit is built to make  your life easier.. Variables, build tooling,
                documentation, and reusable components
              </span>
            </Col>
          </Row>
        </Col>
        <Col style={{ marginTop: 30 }} xs={12} sm={12} md={4}>
          <Row>
            <Col style={{ marginBottom: 5, display: 'flex', justifyContent: 'center' }}>
              <span style={{ fontSize: 18, fontWeight: 'bold' }}>Private Library</span>
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
                alt="picture 1"
                fluid
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <span>
                Landkit is built to make  your life easier.. Variables, build tooling,
                documentation, and reusable components
              </span>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
