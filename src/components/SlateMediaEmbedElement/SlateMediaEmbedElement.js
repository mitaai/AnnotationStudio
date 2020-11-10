/* eslint-disable react/jsx-props-no-spreading */
const SlateMediaEmbedElement = ({
  attributes,
  children,
  element,
  className,
}) => {
  const { url } = element;
  return (
    <div {...attributes} className={className}>
      <div contentEditable={false}>
        <div className="slate-iframe-wrapper">
          <iframe
            className="slate-iframe"
            title="embed"
            src={`${url}`}
            frameBorder="0"
          />
        </div>
      </div>
      {children && children !== []
        ? children
        : (
          <p data-slate-node="element" className="slate-p">
            <span data-slate-node="text">
              <span data-slate-leaf="true">
                <span data-slate-zero-width="n" data-slate-length="0" />
              </span>
            </span>
          </p>
        )}
    </div>
  );
};

export default SlateMediaEmbedElement;
