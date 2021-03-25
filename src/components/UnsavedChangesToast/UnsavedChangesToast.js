/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { Toast } from 'react-bootstrap';

export default function UnsavedChangesToast({
  show = false, onClose = () => {}, delay = 10000, scrollToAnnotation = () => {},
}) {
  return (
    <>
      <div id="unsaved-changes-toast">
        <Toast onClose={onClose} show={show} delay={delay} autohide>
          <Toast.Header>
            <img
              src="holder.js/20x20?text=%20"
              className="rounded mr-2"
              alt=""
            />
            <strong className="mr-auto">Unsaved changes</strong>
          </Toast.Header>
          <Toast.Body>
            You have an annotation that has unsaved changes.
            {' '}
            <span
              id="scroll-to-annotation-text"
              onClick={() => {
                scrollToAnnotation();
                onClose();
              }}
              onKeyDown={() => {}}
            >
              Scroll to
            </span>
            {' '}
            and save the annotation before editing or creating another annotation.
            {' '}
          </Toast.Body>
        </Toast>
      </div>
      <style jsx global>
        {`
          #unsaved-changes-toast {
            position: absolute;
            z-index: 5;
            left: 50vw;
            transform: translate(-50%);
          }

          #scroll-to-annotation-text {
            color: #007bff;
            cursor: pointer;
          }

          #unsaved-changes-toast > .toast {
            max-width: 645px;
          }
              
        `}
      </style>
    </>
  );
}
