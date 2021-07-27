import React, { useEffect, useRef, useState } from "react";
import { app } from "./base";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Card from 'react-bootstrap/Card';
import './App.css';

const db = app.firestore();
const auth = app.auth();

function App() {
  const [fileUrl, setFileUrl] = React.useState(null);
  const [posts, setPosts] = React.useState([]);

  const inputEl = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onFileChange = async (e) => {
    const file = inputEl.current.files[0];
    if (!file) { return; }
    const storageRef = app.storage().ref();
    const fileRef = storageRef.child(file.name);
    var uploadTask = fileRef.put(file);

    uploadTask.on('state_change',

      function progress(snapshot) {
        setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },

      function error(err) {
        console.log(error);
      },

      function complete() {
        console.log('Image uploaded to firebase storage successfully!');
      }
    );
    setFileUrl(await fileRef.getDownloadURL());
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const posTitle = e.target.posTitle.value;
    if (!posTitle || !fileUrl) {
      return;
    }
    await db.collection("posts").doc(posTitle).set({
      title: posTitle,
      imgURL: fileUrl,
    }).then(() => {
      e.target.reset();
      setUploadProgress(0);
    });
  };

  const deletePost = async (id) => {

    await db.collection('posts').doc(id).delete()
      .then(() => {
        console.log("successfully deleted!");
        setPosts(prevState => {
          const newState = prevState.filter((post) => post.title !== id);
          return newState;
        });
      })
      .catch((error) => { console.log("Error removing document:", error) })
  }

  const signInAnonymously = async () => {
    await auth.signInAnonymously()
      .then(() => {
        console.log("signed in sucsesfully");
      })
      .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode + errorMessage);
      });
  }

  auth.onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
    } else {
      signInAnonymously()
    }
  });


  useEffect(() => {
    const fetchPosts = async () => {

      db.collection("posts").onSnapshot((querySnapshot) => {

        querySnapshot.forEach((doc) => {

          setPosts(prevState => {
            if (!prevState.some(post => String(post.title) === String(doc.data().title))) {
              return ([...prevState, doc.data()])
            }
            return prevState
          });
        });

      })

    };
    fetchPosts();
  }, []);

  return (
    <>
      <div className="bg-dark">
        <Container className="bg-light bg-gradient pt-3 pb-3">
          <Form onSubmit={onSubmit}>

            <Col md="4" className=" mx-auto">
              <div className="mb-3 text-white bg-dark rounded-3 p-5">
                <progress value={uploadProgress} max="100" style={{ width: '100%' }}></progress>
                <br />
                <input className="form-control mb-3" onChange={onFileChange} ref={inputEl} type="file" id="formFile" required />

                <Form.Group className="mb-3" controlId="formBasicName">
                  <Form.Control name="posTitle" type="text" placeholder="Title" required />
                </Form.Group>
                <Button variant="primary" type="submit">Create Post</Button>
              </div>
            </Col>

          </Form>
          <ListGroup className="justify-content-md-center center">
            {posts.map((post) => {
              return (
                <ListGroup.Item className="mx-auto col-6 mb-3 p-0 rounded-3" key={post.title}>
                  <Card className="text-center bg-dark bg-gradient text-light" >
                    <Card.Img variant="top" src={post.imgURL} alt={post.title} />
                    <Card.Title className="mt-3">
                      <p>{post.title}</p>
                    </Card.Title>
                    <Card.Body>
                      <Button variant="danger" onClick={() => deletePost(post.title)}>Delete Post</Button>
                    </Card.Body>
                  </Card>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        </Container>
      </div>

    </>
  );
}

export default App;
