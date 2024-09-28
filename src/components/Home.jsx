import React, { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { db } from '../firebase'; 
import { doc, setDoc } from "firebase/firestore"; 
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage
import { v4 as uuidv4 } from 'uuid'; 
import './Home.css';
import VoteDisplay from './VoteDisplay';

const Home = () => {
  const auth = getAuth();
  const storage = getStorage();
  const [candidates, setCandidates] = useState([{ fullName: '', eligibilityDescription: '', img: null, extraFields: [] }]);
  const [electionLink, setElectionLink] = useState('');
  const [message, setMessage] = useState(''); 

  const handleLogout = () => {
    signOut(auth).then(() => {
      setMessage('Successfully logged out.');
    }).catch((error) => {
      setMessage(`Error signing out: ${error.message}`);
    });
  };

  const addCandidate = () => {
    setCandidates([...candidates, { fullName: '', eligibilityDescription: '', img: null, extraFields: [] }]);
  };

  const handleFieldChange = (index, field, value) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[index][field] = value;
    setCandidates(updatedCandidates);
  };

  const addExtraField = (index) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[index].extraFields.push({ title: '', value: '' });
    setCandidates(updatedCandidates);
  };

  const handleExtraFieldChange = (candidateIndex, fieldIndex, field, value) => {
    const updatedCandidates = [...candidates];
    updatedCandidates[candidateIndex].extraFields[fieldIndex][field] = value;
    setCandidates(updatedCandidates);
  };

  const uploadImage = async (file) => {
    try {
      const storageRef = ref(storage, `images/${uuidv4()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error('Error uploading image: ', error);
      return null; 
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    const electionTitle = document.querySelector('input[placeholder="Enter Elections Title"]').value; 
    const electionDescription = document.querySelector('textarea[placeholder="Enter Short Description"]').value; 

    if (user) {
      try {
        const uniqueId = uuidv4();
        const userDocRef = doc(db, "users", uniqueId); // Set the document ID to the unique ID

        const candidatesData = [];

        for (const candidate of candidates) {
          let imageUrl = null;

          if (candidate.img) {
            imageUrl = await uploadImage(candidate.img);
          }

          candidatesData.push({
            fullName: candidate.fullName,
            eligibilityDescription: candidate.eligibilityDescription,
            img: imageUrl,
            extraFields: candidate.extraFields,
          });
        }

        const electionData = {
          electionTitle,
          electionDescription,
          candidates: candidatesData,
          submittedAt: new Date(),
          userId: user.uid,
          userName: user.displayName || 'Anonymous',
          userEmail: user.email || '',
        };

        await setDoc(userDocRef, { ...electionData });

        const electionUrl = `https://online-vote-system.web.app/election/${uniqueId}`;
        setElectionLink(electionUrl);

        setMessage('Election data saved successfully!');
      } catch (error) {
        console.error('Error saving data: ', error.code, error.message);
        setMessage(`Error saving data: ${error.message}`);
      }
    } else {
      setMessage("User is not authenticated.");
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome to the Online Voting System</h1>
      {message && <p className="feedback-message">{message}</p>}
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <form className="election-form">
        <h2>Enter Election Details</h2>
        <label>
          Elections Title:
          <input type="text" placeholder="Enter Elections Title" required aria-label="Election Title" />
        </label>
        <label>
          Short Description:
          <textarea placeholder="Enter Short Description" required aria-label="Short Description"></textarea>
        </label>

        {candidates.map((candidate, index) => (
          <div key={index} className="candidate-section">
            <h3>Enter Candidate {index + 1} Detail</h3>
            <label>
              Upload Img:
              <input type="file" accept="image/*" onChange={(e) => handleFieldChange(index, 'img', e.target.files[0])} aria-label={`Candidate ${index + 1} Image`} />
            </label>
            <br />
            <label>
              Full Name:
              <input type="text" value={candidate.fullName} onChange={(e) => handleFieldChange(index, 'fullName', e.target.value)} required aria-label={`Candidate ${index + 1} Full Name`} />
            </label>
            <br />
            <button type="button" className="add-field-button" onClick={() => addExtraField(index)}>Add Extra Field</button>
            <br />
            {candidate.extraFields.map((extraField, fieldIndex) => (
              <div key={fieldIndex} className="extra-field">
                <label>
                  Field Title:
                  <input
                    type="text"
                    value={extraField.title}
                    onChange={(e) => handleExtraFieldChange(index, fieldIndex, 'title', e.target.value)}
                    aria-label={`Candidate ${index + 1} Extra Field Title ${fieldIndex + 1}`}
                  />
                </label>
                <label>
                  Field Value:
                  <input
                    type="text"
                    value={extraField.value}
                    onChange={(e) => handleExtraFieldChange(index, fieldIndex, 'value', e.target.value)}
                    aria-label={`Candidate ${index + 1} Extra Field Value ${fieldIndex + 1}`}
                  />
                </label>
              </div>
            ))}
            <label>
              Candidate Eligibility Description:
              <textarea value={candidate.eligibilityDescription} onChange={(e) => handleFieldChange(index, 'eligibilityDescription', e.target.value)} required aria-label={`Candidate ${index + 1} Eligibility Description`}></textarea>
            </label>
          </div>
        ))}

        <button type="button" className="add-candidate-button" onClick={addCandidate}>Add Candidate</button>
        <button type="button" className="save-button" onClick={handleSave}>Save</button>
      </form>

      {electionLink && (
        <div className="election-link">
          <h3>Election Link:</h3>
          <input type="text" value={electionLink} readOnly aria-label="Election Link" />
          <button onClick={() => navigator.clipboard.writeText(electionLink)}>Copy Link</button>
        </div>
      )}
      <VoteDisplay />
    </div>
  );
};

export default Home;
