import React from 'react';
import { Container, Card, Button, Row, Col, Alert } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';
import { removeBookId } from '../utils/localStorage';
import Auth from '../utils/auth';

const SavedBooks: React.FC = () => {
  const { loading, data, error } = useQuery(GET_ME);
  const [removeBook, { error: removeError }] = useMutation(REMOVE_BOOK, {
    refetchQueries: [{ query: GET_ME }],
  });

  if (loading) return <h2>LOADING...</h2>;
  if (error) return <Alert variant="danger">Error: {error.message}</Alert>;

  const userData = data?.me || { username: '', savedBooks: [] };

  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) return false;

    try {
      await removeBook({ variables: { bookId } });
      removeBookId(bookId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing {userData.username}'s books!</h1>
        </Container>
      </div>

      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>

        {removeError && <Alert variant="danger">{removeError.message}</Alert>}

        <Row>
          {userData.savedBooks.map((book: any) => (
            <Col key={book.bookId} md="4">
              <Card border="dark" className="mb-3">
                {book.image && (
                  <Card.Img
                    src={book.image}
                    alt={`Cover for ${book.title}`}
                    variant="top"
                  />
                )}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">
                    Authors: {Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}
                  </p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
