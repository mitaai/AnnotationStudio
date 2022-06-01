/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useSession } from 'next-auth/client';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Card, Col, Modal,
} from 'react-bootstrap';
import { ChevronCompactRight, X } from 'react-bootstrap-icons';
import Layout from '../../components/Layout';
import UnauthorizedCard from '../../components/UnauthorizedCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import DocumentForm from '../../components/DocumentForm';
import styles from './new.module.scss';

const NewDocument = ({ statefulSession }) => {
  const [session, loading] = useSession();
  const [pageLoading, setPageLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  const [minimize, setMinimize] = useState();
  const [showUploadModal, setShowUploadModal] = useState();

  const transition = 'all 0.5s';
  const border = '1px solid #dddddd';
  const states = {
    default: {
      leftPanel: {
        left: 0,
        width: 'calc(100vw - 450px)',
      },
      rightPanel: {
        left: 'calc(100vw - 450px)',
        width: 450,
      },
      chevron: {
        left: 'calc(100vw - 450px - 20px)',
        transform: 'rotate(-45deg)',
      },
      chevronSpan: {
        top: 3,
        left: 6,
        transform: 'rotate(45deg)',
      },
    },
    minimize: {
      leftPanel: {
        left: 0,
        width: 'calc(100vw - 20px)',
      },
      rightPanel: {
        left: 'calc(100vw - 20px)',
        width: 450,
      },
      chevron: {
        left: 'calc(100vw - 20px - 20px)',
        transform: 'rotate(-45deg)',
      },
      chevronSpan: {
        top: 5,
        left: 4,
        transform: 'rotate(-135deg)',
      },
    },
  };

  const state = states[minimize ? 'minimize' : 'default'];

  const secondNavbarExtraContent = (
    <div style={{
      position: 'absolute', top: -8, left: -33, height: 64,
    }}
    >
      <div style={{
        position: 'absolute', transition, left: `calc(100vw - ${minimize ? 233 : 450}px)`, height: '100%', display: 'flex', flexDirection: 'row',
      }}
      >
        <Button
          className={styles.uploadDocumentBtn}
          style={{
            transition,
            left: -112 + (minimize ? 5 : 0),
          }}
          onClick={() => setShowUploadModal(true)}
        >
          Upload
        </Button>
        <div style={{
          transition,
          height: 44,
          width: 1,
          backgroundColor: '#dddddd',
          margin: `auto ${minimize ? 0 : 12}px auto 0px`,
          opacity: minimize ? 0 : 1,
        }}
        />
        <Button
          className={styles.createNewDocumentBtn}
          onClick={() => console.log('hello')}
        >
          Create Document
        </Button>
      </div>
    </div>
  );


  const spacer = (
    <div
      style={{
        width: 100, height: 6, borderRadius: 3, backgroundColor: '#eeeeee', margin: '0px auto',
      }}
    />
  );

  useEffect(() => {
    if (loading === false) {
      setPageLoading(false);
    }
  }, [loading]);

  return (
    <>
      <Layout
        alerts={errors}
        type={`create-new-document${minimize ? '-minimize' : ''}`}
        breadcrumbs={[
          { name: 'Documents', href: '/documents' },
          { name: 'Create a new document' },
        ]}
        title="New Document"
        statefulSession={statefulSession}
        secondNavbarExtraContent={secondNavbarExtraContent}
        noContainer
      >
        <div style={{
          display: 'flex', flexDirection: 'row', position: 'relative', height: '100%', borderTop: border,
        }}
        >
          <div style={{
            position: 'absolute', height: '100%', transition, ...state.leftPanel,
          }}
          />
          <div
            style={{
              position: 'absolute',
              zIndex: 2,
              top: 'calc(25%)',
              backgroundColor: '#F9F9F9',
              borderLeft: border,
              borderTop: border,
              borderRight: '1px solid transparent',
              borderBottom: '1px solid transparent',
              height: 40,
              width: 40,
              borderRadius: 20,
              cursor: 'pointer',
              transition,
              ...state.chevron,
            }}
            onClick={() => setMinimize(!minimize)}
          >
            <span style={{
              position: 'absolute', ...state.chevronSpan,
            }}
            >
              <ChevronCompactRight size={20} />
            </span>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            height: '100%',
            backgroundColor: '#F9F9F9',
            borderLeft: border,
            padding: '20px 24px',
            overflowY: 'overlay',
            transition,
            ...state.rightPanel,
          }}
          >
            <div style={{
              fontSize: 22, fontWeight: 'bold', color: '#424242', marginBottom: 20,
            }}
            >
              Metadata
            </div>
            <div style={{
              fontSize: 16, color: '#424242', fontWeight: 'bold', marginBottom: 10,
            }}
            >
              Title
            </div>
            <input
              placeholder="Untitled"
              style={{
                backgroundColor: '#fafafa', border: '1px solid #CDCEDA', borderRadius: 6, padding: '8px 12px', marginBottom: 20,
              }}
            />
            <div style={{
              fontSize: 16, color: '#424242', fontWeight: 'bold', marginBottom: 10,
            }}
            >
              Type Of Resource
            </div>
            <input
              placeholder="Untitled"
              style={{
                backgroundColor: '#fafafa', border: '1px solid #CDCEDA', borderRadius: 6, padding: '8px 12px', marginBottom: 20,
              }}
            />
            <div style={{
              display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10,
            }}
            >
              <span style={{
                fontSize: 16, color: '#424242', fontWeight: 'bold', flex: 1,
              }}
              >
                Contributor(s)
              </span>
              <span style={{ color: '#355CBC', fontSize: 13, cursor: 'pointer' }}>+ Add a contributor</span>
            </div>
            <input
              placeholder="Untitled"
              style={{
                backgroundColor: '#fafafa', border: '1px solid #CDCEDA', borderRadius: 6, padding: '8px 12px', marginBottom: 30,
              }}
            />
            <div style={{
              fontSize: 14, color: '#355CBC', marginBottom: 30, textAlign: 'center',
            }}
            >
              + Show additional metadata
            </div>
            {spacer}
            <div style={{
              fontSize: 22, fontWeight: 'bold', color: '#424242', marginTop: 30, marginBottom: 20,
            }}
            >
              Share
            </div>
            <input
              placeholder="Untitled"
              style={{
                backgroundColor: '#fafafa', border: '1px solid #CDCEDA', borderRadius: 6, padding: '8px 12px', marginBottom: 40,
              }}
            />
            {spacer}
            <div style={{
              fontSize: 22, fontWeight: 'bold', color: '#424242', marginTop: 30, marginBottom: 20,
            }}
            >
              Status
            </div>
            <input
              placeholder="Untitled"
              style={{
                backgroundColor: '#fafafa', border: '1px solid #CDCEDA', borderRadius: 6, padding: '8px 12px', marginBottom: 30,
              }}
            />
          </div>
        </div>
        <Modal id="upload-document-modal" size="lg" show={showUploadModal} onHide={() => setShowUploadModal()}>
          <Modal.Body style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <div style={{
                flex: 1, fontSize: 22, fontWeight: 'bold', color: '#363D4E', marginLeft: 5,
              }}
              >
                Upload Document
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #BDBDBD',
                borderRadius: 6,
              }}
              >
                <X size={20} color="#BDBDBD" />
              </div>
            </div>
            <div style={{
              display: 'flex', flexDirection: 'row', marginTop: 50, marginBottom: 70,
            }}
            >
              <div style={{
                flex: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              }}
              >
                <img src="/upload-document.svg" height="140" alt="" />
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column', flex: 3, marginRight: 5,
              }}
              >
                <div style={{ color: '#898C95', fontSize: 17, fontWeight: 300 }}>Upload PDF, DOCX, ODT, or EPUB</div>
                <div id="file-input-container">
                  <input type="file" />
                </div>
                <div style={{
                  color: '#888E9F', fontSize: 16, marginTop: 10, paddingLeft: 2, fontWeight: 300,
                }}
                >
                  Limit: 4 MB (file size may increase during processing)
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 'bold', color: '#888E9F', marginTop: 15, paddingLeft: 2,
                }}
                >
                  Do not close broswer window while the file is being processed
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </Layout>
      <style jsx global>
        {`
        #upload-document-modal {
          border-radius: 4px;
          border: none;
        }
        #file-input-container {
          margin-top: 10px;
          background-color: #f9f9f9;
          border: 1px solid #f0f0f0;
          border-radius: 2px;
        }

        #file-input-container input {
          color: #9E9E9E;
        }

        #file-input-container input::file-selector-button {
          background-color: #355CBC;
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 2px;
          margin-right: 8px;
        }
      `}
      </style>
    </>
  );
};

/*
<Col lg="12" className="mx-auto">
  <Card style={{ marginBottom: 30 }}>
    {((!session && loading) || (session && pageLoading)) && (
      <LoadingSpinner />
    )}
    {!session && !loading && (
      <UnauthorizedCard />
    )}
    {session && !loading && !pageLoading && (
      <>
        <Card.Header><Card.Title>Create a new document</Card.Title></Card.Header>
        <Card.Body>
          <DocumentForm
            mode="new"
            session={session}
            setErrors={setErrors}
            errors={errors}
            setPageLoading={setPageLoading}
          />
        </Card.Body>
      </>
    )}
  </Card>
</Col>
*/

export default NewDocument;
