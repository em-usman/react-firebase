import { useEffect, useState } from 'react'
import './App.css'
import Auth from "./Components/Auth"
import { db, auth, storage } from "./Config/Firebase"
import { getDocs, collection,addDoc, deleteDoc,updateDoc, doc } from 'firebase/firestore'
import { ref, uploadBytes } from 'firebase/storage'

function App() {
  const [movieList, setMovieList] = useState([]);

  const [newMovieTitle, setNewMovieTitle] = useState("");
  const [newReleaseDate, setNewReleaseDate] = useState(0);
  const [isNewMovieOscar, setIsNewMovieOscar] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState("");
  const [fileUpload, setFileUpload] = useState(null);

  const movieCollectionRef = collection(db, "movies");

   const getMovieList = async () => {
     try {
       const data = await getDocs(movieCollectionRef);
       const filteredData = data.docs.map((doc) => ({
         ...doc.data(),
         id: doc.id,
       }));
       setMovieList(filteredData);
     } catch (err) {
       console.error(err);
     }
   };
  
    const deleteMovie = async (id) => {
      const movieDoc = doc(db, "movies", id);
      await deleteDoc(movieDoc);
    };
  
  const updateMovieTitle = async (id) => {
    const movieDoc = doc(db, "movies", id);
    await updateDoc(movieDoc, {Title: updatedTitle});
  };
  
  const uploadFile = async () => {
    if (!fileUpload) return;
    const filesFolderRef = ref(storage, `projectFiles/${fileUpload.name}`);
    try {
      await uploadBytes(filesFolderRef, fileUpload);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getMovieList();
}, [])
  
  const onSubmitMovie = async () => {
    try {
      await addDoc(movieCollectionRef, { Title: newMovieTitle, ReleaseDate: newReleaseDate, receivedAnOscar: isNewMovieOscar, userId:auth?.currentUser?.uid });
      getMovieList();
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <div className="App">
      <Auth />

      <div>
        <input
          placeholder="Movie title..."
          onChange={(e) => setNewMovieTitle(e.target.value)}
        />
        <input
          placeholder="Release Date..."
          type="number"
          onChange={(e) => setNewReleaseDate(Number (e.target.value))}
        />
        <input type="checkbox" checked={isNewMovieOscar} onChange={(e) => setIsNewMovieOscar(e.target.checked)} />
        <label>Received an Oscar</label>
        <button onClick={onSubmitMovie}>Submit Movie</button>
      </div>

      <div>
        {movieList.map((movie) => (
          <div>
            <h1 style={{ color: movie.receivedAnOscar ? "green" : "red" }}>
              {movie.Title}
            </h1>
            <p>{movie.ReleaseDate}</p>
            <button onClick={() => deleteMovie(movie.id)}>Delete Movie</button>
            <input placeholder="new title..." onChange={(e) => setUpdatedTitle(e.target.value)}/>
            <button onClick={() => updateMovieTitle(movie.id)}>Update Title</button>
          </div>
        ))}
      </div>

      <div>
        <input type="file" onChange={(e) => setFileUpload(e.target.files[0])}/>
        <button onClick={uploadFile}>Upload File</button>
      </div>
    </div>
  );
}

export default App
