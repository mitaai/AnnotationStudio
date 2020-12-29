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
            data-testid="slate-iframe"
          />
        </div>
      </div>
      {children}
    </div>
  );
};

export default SlateMediaEmbedElement;
