import { Formik } from 'formik';
import * as yup from 'yup';
import React, { useState } from 'react';
import {
  Button, Col, Form, Row,
} from 'react-bootstrap';
import FormTextField from '../../FormTextField';
import { createUserManually } from '../../../utils/userUtil';
import LoadingSpinner from '../../LoadingSpinner';

const schema = yup.object({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  affiliation: yup.string().required(),
  email: yup.string().email().required('Email is required'),
});

function AddNewUserForm({ onHide, setAlerts }) {
  const [loading, setLoading] = useState();
  const onSubmit = async (userData) => {
    setLoading(true);
    await createUserManually(userData)
      .then(() => {
        setLoading();
        setAlerts((prevState) => [...prevState, {
          text: 'User created successfully',
          variant: 'success',
        }]);
        onHide();
      })
      .catch((err) => {
        setLoading();
        setAlerts((prevState) => [...prevState, { text: err.message, variant: 'danger' }]);
        onHide();
      });
    onHide();
  };
  return (
    <Row>
      <Col>
        <Formik
          validationSchema={schema}
          onSubmit={onSubmit}
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            affiliation: '',
          }}
        >
          {({
            handleSubmit,
            // handleChange,
            // values,
            // errors,
            isValid,
            isSubmitting,
          }) => (
            <Form noValidate onSubmit={handleSubmit}>
              {loading ? <LoadingSpinner /> : (
                <>
                  <Col style={{ padding: 0 }}>
                    <FormTextField
                      as={Col}
                      sm="4"
                      controlId="validationFormik01"
                      label="First name"
                      type="text"
                      name="firstName"
                    />
                    <FormTextField
                      as={Col}
                      sm="4"
                      controlId="validationFormik02"
                      label="Last name"
                      type="text"
                      name="lastName"
                    />
                    <FormTextField
                      as={Col}
                      sm="4"
                      controlId="validationFormik03"
                      label="Email"
                      type="email"
                      name="email"
                    />
                    <FormTextField
                      as={Col}
                      sm="4"
                      controlId="validationFormik04"
                      label="Affiliation"
                      type="text"
                      name="affiliation"
                    />
                  </Col>
                  <Col>
                    <Button
                      disabled={!isValid || isSubmitting}
                      variant="primary"
                      as="input"
                      size="md"
                      type="submit"
                      value="Add User"
                    />
                  </Col>
                </>
              )}
            </Form>
          )}
        </Formik>
      </Col>
    </Row>
  );
}

export default AddNewUserForm;
