import { useState } from 'react';
import AnnotationChannel from '../AnnotationChannel';
import Document from '../Document';


function DocumentViewContainer({
  footerHeight = 0,
  displayAnnotationsInChannels,
  deleteAnnotationFromChannels,
  setAnnotationChannel1Loaded,
  moveAnnotationsToCorrectSpotBasedOnFocus,
  focusedAnnotationsRef,
  channelAnnotations,
  session,
  showMoreInfoShareModal,
  setShowMoreInfoShareModal,
  setShowMaxedAnnotationLengthToast,
  membersIntersection,
  alerts,
  setAlerts,
  documentWidth,
  extraMargin,
  setShowUnsavedChangesToast,
  setShowMaxTextLengthReached,
  annotationIdBeingEdited,
  addActiveAnnotation,
  removeActiveAnnotation,
  setChannelAnnotations,
  setDocumentHighlightedAndLoaded,
  annotations,
  documentHighlightedAndLoaded,
  addAnnotationToChannels,
  highlightTextToAnnotate,
  document,
  showCannotAnnotateDocumentToast,
  setShowCannotAnnotateDocumentToast,
  setAnnotationChannel2Loaded,
  documentZoom,
  annotationChanelsStateful,
}) {
  const [largeFontSize, setLargeFontSize] = useState();
  return (
    <div id="document-container" className={footerHeight > 0 && 'has-footer'}>
      <div id="document-inner-container">
        <AnnotationChannel
          stateful={annotationChanelsStateful}
          documentZoom={documentZoom}
          channelAnnotations={channelAnnotations}
          show={displayAnnotationsInChannels}
          deleteAnnotationFromChannels={deleteAnnotationFromChannels}
          setAnnotationChannelLoaded={setAnnotationChannel1Loaded}
          focusOnAnnotation={moveAnnotationsToCorrectSpotBasedOnFocus}
          side="left"
          focusedAnnotation={focusedAnnotationsRef.left}
          annotations={channelAnnotations.left}
          user={session ? session.user : undefined}
          showMoreInfoShareModal={showMoreInfoShareModal}
          setShowMoreInfoShareModal={setShowMoreInfoShareModal}
          setShowMaxedAnnotationLengthToast={setShowMaxedAnnotationLengthToast}
          membersIntersection={membersIntersection}
          alerts={alerts}
          setAlerts={setAlerts}
          largeFontSize={largeFontSize}
          setLargeFontSize={setLargeFontSize}
        />
        <div
          id="document-container-col"
          style={{
            transform: `scale(${documentZoom / 100}) translateY(0px)`,
            transformOrigin: 'top center',
            minWidth: documentWidth,
            maxWidth: documentWidth,
            marginLeft: extraMargin,
            marginRight: extraMargin,
          }}
        >
          <Document
            setShowUnsavedChangesToast={setShowUnsavedChangesToast}
            setShowMaxTextLengthReached={setShowMaxTextLengthReached}
            annotationIdBeingEdited={annotationIdBeingEdited}
            addActiveAnnotation={addActiveAnnotation}
            removeActiveAnnotation={removeActiveAnnotation}
            displayAnnotationsInChannels={displayAnnotationsInChannels}
            setChannelAnnotations={
                            (annos) => {
                              setChannelAnnotations(annos);
                              setDocumentHighlightedAndLoaded(true);
                            }
                          }
            annotations={annotations}
            documentHighlightedAndLoaded={documentHighlightedAndLoaded}
            addAnnotationToChannels={addAnnotationToChannels}
            annotateDocument={
                            async (mySelector, annotationID) => {
                              await highlightTextToAnnotate(mySelector, annotationID);
                            }
                          }
            documentToAnnotate={document}
            documentZoom={documentZoom}
            alerts={alerts}
            setAlerts={setAlerts}
            user={session ? session.user : undefined}
            showCannotAnnotateDocumentToast={showCannotAnnotateDocumentToast}
            setShowCannotAnnotateDocumentToast={setShowCannotAnnotateDocumentToast}
          />
        </div>
        <AnnotationChannel
          stateful={annotationChanelsStateful}
          documentZoom={documentZoom}
          channelAnnotations={channelAnnotations}
          show={displayAnnotationsInChannels}
          deleteAnnotationFromChannels={deleteAnnotationFromChannels}
          setAnnotationChannelLoaded={setAnnotationChannel2Loaded}
          focusOnAnnotation={moveAnnotationsToCorrectSpotBasedOnFocus}
          side="right"
          focusedAnnotation={focusedAnnotationsRef.right}
          annotations={channelAnnotations.right}
          user={session ? session.user : undefined}
          showMoreInfoShareModal={showMoreInfoShareModal}
          setShowMoreInfoShareModal={setShowMoreInfoShareModal}
          setShowMaxedAnnotationLengthToast={setShowMaxedAnnotationLengthToast}
          membersIntersection={membersIntersection}
          alerts={alerts}
          setAlerts={setAlerts}
          largeFontSize={largeFontSize}
          setLargeFontSize={setLargeFontSize}
        />
      </div>
    </div>
  );
}

export default DocumentViewContainer;

