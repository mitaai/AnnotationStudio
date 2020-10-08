import { Field } from 'formik';

const SemanticField = ({ component, ...fieldProps }) => {
  const { showErrorsInline, ...rest } = fieldProps;

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Field {...rest}>
      {({
        field: { value, onBlur, ...field },
        form: {
          setFieldValue, submitCount, touched, errors, handleBlur,
        },
        ...props
      }) => React.createElement(component, {
        ...rest,
        ...field,
        ...props,
        value: value || [''],
        ...((submitCount >= 1 || touched[field.name]) && errors[field.name]
          ? {
            error:
              showErrorsInline === false
                ? true
                : {
                  content: errors[field.name],
                },
          }
          : {}),
        onChange: (e, { value: newValue, checked }) => (
          setFieldValue(fieldProps.name, newValue || checked)
        ),
        onBlur: handleBlur,
      })}
    </Field>
  );
};

export default SemanticField;
