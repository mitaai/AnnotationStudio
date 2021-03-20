import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Image from 'react-bootstrap/Image';
import Link from 'next/link';
import moment from 'moment';

function Footer() {
  return (
    <footer className="footer mt-auto py-3 as-footer">
      <Container fluid className="px-5">
        <Row>
          <Col>
            <Image src="/logo_mit.png" alt="MIT logo" className="logo mr-3 mt-2" />
            <Image src="/logo_aai.png" alt="Active Archives Initiative logo" className="logo mr-3 mt-2" />
            <Image src="/logo_neh.png" alt="National Endowment for the Humanities logo" className="logo mt-2" />
          </Col>
          <Col className="text-muted text-right mt-n1">
            <small>
              &copy;
              {' '}
              {moment().year()}
              {' '}
              Active Archives Initiative at MIT
              <br />
              <Link href="#tos"><a href="#tos">Terms and Conditions</a></Link>
              {' '}
              |
              {' '}
              <Link href="#privacy"><a href="#privacy">Privacy Policy</a></Link>
              {' '}
              |
              {' '}
              <Link href="#cookie"><a href="#cookie">Cookie Policy</a></Link>
              {' '}
            </small>
          </Col>
        </Row>
      </Container>
      <style jsx>
        {`
          .footer { background-color: #f5f5f5 }
        `}
      </style>
    </footer>
  );
}

export default Footer;
