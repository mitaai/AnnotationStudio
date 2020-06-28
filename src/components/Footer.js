import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';

function Footer() {
  return (
    <footer className="footer mt-auto py-3">
      <Container>
        <Image src="/logo_mit.png" alt="MIT logo" className="logo mr-3" />
        <Image src="/logo_aai.png" alt="Active Archives Initiative logo" className="logo mr-3" />
        <Image src="/logo_neh.png" alt="National Endowment for the Humanities logo" className="logo" />
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
