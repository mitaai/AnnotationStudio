/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { Toast } from 'react-bootstrap';

export default function MaxedAnnotationLengthToast({
  show = false, onClose = () => {}, delay = 10000,
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
            <strong className="mr-auto">Maxed Annotation Length Reached</strong>
          </Toast.Header>
          <Toast.Body>
            Annotations must be 750 characters or less
          </Toast.Body>
        </Toast>
      </div>
      <style jsx global>
        {`
          #unsaved-changes-toast {
            top: 150px;
            position: absolute;
            z-index: 5;
            left: 50vw;
            transform: translate(-50%);
          }

          #unsaved-changes-toast > .toast {
            max-width: 645px;
            border: 1px solid #c90000;
          }
        `}
      </style>
    </>
  );
}
