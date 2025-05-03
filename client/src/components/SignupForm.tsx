import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { ADD_USER } from '../utils/mutations';
import Auth from '../utils/auth';

interface SignupFormProps {
  handleModalClose: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ handleModalClose }) => {
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [validated, setValidated] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const [addUser, { error }] = useMutation(ADD_USER);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const { data } = await addUser({
        variables: {
          username: userFormData.username,
          email: userFormData.email,
          password: userFormData.password,
        },
      });
      Auth.login(data.addUser.token);
      handleModalClose();
    } catch {
      setShowAlert(true);
    }

    setUserFormData({ username: '', email: '', password: '' });
    setValidated(false);
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
      {error && <Alert variant="danger">Signup failed: {error.message}</Alert>}
      <Alert
        dismissible
        onClose={() => setShowAlert(false)}
        show={showAlert}
        variant="danger"
      >
        Something went wrong with your signup!
      </Alert>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="username">Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Your username"
          name="username"
          value={userFormData.username}
          onChange={handleInputChange}
          required
        />
        <Form.Control.Feedback type="invalid">
          Username is required!
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="email">Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Your email address"
          name="email"
          value={userFormData.email}
          onChange={handleInputChange}
          required
        />
        <Form.Control.Feedback type="invalid">
          Email is required!
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="password">Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Your password"
          name="password"
          value={userFormData.password}
          onChange={handleInputChange}
          required
        />
        <Form.Control.Feedback type="invalid">
          Password is required!
        </Form.Control.Feedback>
      </Form.Group>

      <Button
        disabled={
          !(
            userFormData.username &&
            userFormData.email &&
            userFormData.password
          )
        }
        type="submit"
        variant="success"
      >
        Submit
      </Button>
    </Form>
  );
};

export default SignupForm;
