import React, {
  useEffect,
  useState,
} from 'react';
import {
  Button,
  OverlayTrigger,
  Popover,
  Card,
  DropdownButton,
  Dropdown,
  Navbar,
  Container,
  Nav,
} from 'react-bootstrap';

import {
  Check2Square,
  Stack,
} from 'react-bootstrap-icons';
import { findNGrams } from '../../utils/nGramUtil';
import LoadingSpinner from '../LoadingSpinner';
import TextAnalysisInfo from '../TextAnalysisInfo/TextAnalysisInfo';
import TileBadge from '../TileBadge';


function TextAnalysisPopover({ textAnalysisData, loadingTextAnalysisData, getTextAnalysisData }) {
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState();
  const [tab, setTab] = useState('overview');

  const textAnalysisColor = '#19436F';
  const featuresIcon = <Check2Square color={textAnalysisColor} size={14} />;
  const tabs = {
    loading: <LoadingSpinner />,
    runAnalysis: <TextAnalysisInfo
      featuresIcon={featuresIcon}
      textAnalysisColor={textAnalysisColor}
    />,
    overview: <div>overview</div>,
    filter: <div>filter</div>,
    features: <div>features</div>,
  };

  let t = tab;
  if (loadingTextAnalysisData) {
    t = 'loading';
  } else if (textAnalysisData === undefined) {
    t = 'runAnalysis';
  }

  console.log('textAnalysisData', textAnalysisData);

  useEffect(() => {
    console.log(findNGrams({
      size: 3,
      sourceTexts: [{ slug: 'hello', text: 'hello my name is bob your name is susan and his name is Tom'.split(' ') }],
      text: 'hello my name is Bob your name is Tom and his name is Susan'.split(' '),
    }));
  }, []);

  const filterPopoverComponent = (
    <Popover id="filter-popover">
      <Popover.Content>
        <Card>
          {false && (
            <Card.Header style={{ display: 'flex', alignItems: 'center' }}>
              <h5 style={{ marginBottom: 0, flex: 1 }}>Text Analysis</h5>
              { textAnalysisData
                ? (
                  <DropdownButton id="dropdown-basic-button" title="Overview" size="sm">
                    <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
                    <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
                    <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
                  </DropdownButton>
                )
                : <div>Run text analysis</div>}

            </Card.Header>
          )}
          <Card.Body style={{ padding: 0 }}>
            <Navbar bg="light" variant="light" style={{ borderRadius: '4px 4px 0px 0px' }}>
              <Container>
                <Navbar.Brand>Text Analysis</Navbar.Brand>
                {
                  textAnalysisData
                    ? (
                      <Nav className="me-auto text-analysis-navbar">
                        <Nav.Link onClick={() => setTab('overview')} active={tab === 'overview'}>Overview</Nav.Link>
                        <Nav.Link onClick={() => setTab('filter')} active={tab === 'filter'}>Filter</Nav.Link>
                        <Nav.Link onClick={() => setTab('features')} active={tab === 'features'}>Features</Nav.Link>
                      </Nav>
                    )
                    : (
                      <TileBadge
                        key="text-analysis-status"
                        color="dark-blue"
                        text="Run Analysis"
                        fontSize={12}
                        paddingLeft={8}
                        paddingRight={8}
                        paddingTop={6}
                        paddingBottom={6}
                        onClick={getTextAnalysisData}
                      />
                    )
                }

              </Container>
            </Navbar>
            <div style={{ padding: '15px 20px 30px 20px' }}>
              {tabs[t]}
            </div>
          </Card.Body>
        </Card>
      </Popover.Content>
    </Popover>
  );

  const filterActive = false;

  return (
    <>
      <OverlayTrigger
        trigger="click"
        key="filter-popover"
        placement="bottom"
        onToggle={(isOpen) => setIsFilterPopoverOpen(isOpen)}
        rootClose
        overlay={filterPopoverComponent}
      >
        <Button
          id="btn-text-analysis-filter"
          size="sm"
          variant={(filterActive || isFilterPopoverOpen) ? 'primary' : 'outline-primary'}
        >
          <div>
            <Stack size="1em" />
          </div>
        </Button>
      </OverlayTrigger>

      <style jsx global>
        {`

          .text-analysis-navbar .nav-link.active {
            color: #015999 !important;
          }
  
          #btn-text-analysis-filter .badge {
            opacity: 0.0;
            transition: opacity 0.25s;
            position: relative;
            top: -2px !important;
          }
          #btn-text-analysis-filter .badge.active {
            opacity: 1.0;
          }
          
          #btn-text-analysis-filter {
            margin-left: 5px;
            margin-top: 7px;
            float: right;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
          }
  
          #btn-text-analysis-filter svg {
            position: relative;
            top: -1px;
          }
  
          #filter-popover {
            max-width: 30vw;
            width: 30vw;
          }
  
          #filter-popover .card {
            border: none;
          }
  
          #filter-popover .form-label {
            font-weight: bold;
          }
  
          #filter-popover .popover-body {
            padding: 0px;
          }
  
          #filter-popover .filter-option-checkbox {
            margin-right: 4px;
          }
  
          #filter-popover .filter-option-name {
            position: relative;
            top: -2px;
            font-size: 14px;
          }
  
          #filter-popover .rbt-input-multi.form-control.rbt-input {
            padding: 6px;
          }
  
          .token-badge {
              position: relative;
              top: -1px;
              margin-left: 4px;
              font-size: 10px;
              border-radius: 5px;
              padding: 1px 2px;
          }
  
          .rbt-token-active .token-badge {
              border-color: white;
          }
  
          .no-matches-token {
              background-color: #eeeeee !important;
              color: #616161 !important;
          }
  
          .no-matches-token .token-badge {
              border-color: #616161 !important; 
          }
          
          `}
      </style>
    </>
  );
}

export default TextAnalysisPopover;
