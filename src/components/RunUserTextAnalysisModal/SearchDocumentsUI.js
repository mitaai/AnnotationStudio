/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-underscore-dangle */
import React, {
  useState,
  useEffect,
} from 'react';
import Fuse from 'fuse.js';
import {
  Button,
  FormControl,
  InputGroup,
} from 'react-bootstrap';
import {
  Check, Search,
} from 'react-bootstrap-icons';
import styles from './RunUserTextAnalysisModal.module.scss';


function SearchDocumentsUI({
  documents, selectedDocuments = {}, onSelect = () => {}, onDone,
}) {
  const [fuse, setFuse] = useState();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (fuse === undefined && documents) {
      setFuse(new Fuse(documents, {
        includeScore: true,
        // Search in `key`, `name` and in `symbol` array
        keys: ['title'],
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documents]);

  let res;
  if (fuse) {
    if (query.length > 0) {
      res = fuse.search(query).map(({ item }) => item);
    } else {
      res = documents;
    }
  }

  const rowItem = (doc) => {
    const { _id, title, contributors } = doc;
    const contributor = contributors.find(({ type }) => type === 'Author');
    const author = contributor?.name || 'Unknown';
    const docData = { ...doc, author };
    const selected = selectedDocuments[_id] !== undefined;
    return (
      <div
        className={styles.rowItem}
        onClick={selected ? () => {} : () => onSelect(docData)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 'bold' }}>{title}</div>
          <div style={{ fontSize: 12, color: '#757575' }}>{author}</div>
        </div>
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 6,
        }}
        >
          {selected
            ? <Check size={22} color="#026EFF" />
            : (
              <Button
                className={styles.addButton}
                variant="outline-primary"
                size="sm"
                onClick={() => onSelect(docData)}
              >
                Add
              </Button>
            )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div>
        <InputGroup className="mb-3">
          <InputGroup.Text id="search-icon-container">
            <Search size={14} />
          </InputGroup.Text>
          <FormControl
            id="admin-panel-search-input"
            placeholder="Search Documents"
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            aria-label="search-documents"
            aria-describedby="basic-addon1"
          />
          <InputGroup.Text id="done-container" onClick={onDone}>
            Done
          </InputGroup.Text>
        </InputGroup>
        <div
          style={{
            border: '1px solid #eeeeee',
            backgroundColor: '#fafafa',
            height: 160,
            marginTop: -10,
            marginBottom: 10,
            overflowY: 'scroll',
            paddingBottom: 10,
          }}
        >
          {res ? res.map(rowItem) : 'No results'}
        </div>
      </div>


      <style jsx global>
        {`
        #admin-panel-card {
          height: 100%;
        }
        #admin-panel-search-input {
          box-shadow: none;
        }
        #search-icon-container {
          border-right-width: 0px;
          border-top-right-radius: 0px;
          border-bottom-right-radius: 0px;
        }
        #done-container {
          border-left-width: 0px;
          border-top-left-radius: 0px;
          border-bottom-left-radius: 0px;
          cursor: pointer;
          color: #616161;
          transition: background-color 0.25s;
        }

        #done-container:hover {
          background-color: #cdd4db;
        }
      `}
      </style>
    </>
  );
}

export default SearchDocumentsUI;

