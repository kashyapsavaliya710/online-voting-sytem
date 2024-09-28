import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; 
import './ElectionPage.css'; 

const ElectionPage = () => {
  const { uniqueId } = useParams();
  console.log("Unique ID from URL:", uniqueId); 
  const [electionData, setElectionData] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchElectionData = async () => {
      setLoading(true); 
      try {
        const electionDocRef = doc(db, "users", uniqueId);
        const electionDocSnap = await getDoc(electionDocRef);
    
        if (electionDocSnap.exists()) {
          const data = electionDocSnap.data();
          const candidates = data.candidates || [];
    
          setElectionData({
            electionTitle: data.electionTitle,
            electionDescription: data.electionDescription,
            candidates: candidates.map(candidate => ({
              id: candidate.id,
              fullName: candidate.fullName,
              eligibilityDescription: candidate.eligibilityDescription,
              img: candidate.img,
              votes: candidate.votes || 0,
            })),
          });
        } else {
          console.log("No such election document!");
          alert("Election not found. Please check the unique ID.");
        }
      } catch (error) {
        console.error("Error fetching election data:", error);
        alert("Failed to fetch election data. Please try again later.");
      } finally {
        setLoading(false); 
      }
    };

    if (uniqueId) {
      fetchElectionData();
    }
  }, [uniqueId]);

  const handleVote = async () => {
    if (selectedCandidate) {
      try {
        const electionDocRef = doc(db, "users", uniqueId);
        const electionDoc = await getDoc(electionDocRef);
        
        if (!electionDoc.exists()) {
          console.error("Election document does not exist");
          alert("Invalid election. Please try again.");
          return;
        }
  
        const data = electionDoc.data();
        const candidates = data.candidates || [];
  
        const candidateExists = candidates.some(candidate => candidate.id === selectedCandidate.id);
        if (!candidateExists) {
          console.error("Candidate does not exist in the election candidates");
          alert("Invalid candidate. Please try again.");
          return;
        }
  
        const updatedCandidates = candidates.map(candidate => 
          candidate.id === selectedCandidate.id 
            ? { ...candidate, votes: (candidate.votes || 0) + 1 } 
            : candidate
        );

        await updateDoc(electionDocRef, {
          candidates: updatedCandidates,
        });
  
        console.log(`Voted for: ${selectedCandidate.fullName}`);
        alert(`Your vote for ${selectedCandidate.fullName} has been recorded!`);
        navigate('/confirm'); // Navigate after voting

        // Update local state with new vote count
        setElectionData(prevState => ({
          ...prevState,
          candidates: prevState.candidates.map(candidate =>
            candidate.id === selectedCandidate.id
              ? { ...candidate, votes: candidate.votes + 1 }
              : candidate
          )
        }));
      } catch (error) {
        console.error("Error submitting vote:", error);
        alert("Failed to submit your vote. Please try again.");
      }
    } else {
      alert("Please select a candidate to vote.");
    }
  };

  // Loading state
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // No candidates state
  if (electionData && electionData.candidates.length === 0) {
    return <div className="no-candidates">No candidates found for this election.</div>;
  }

  // Election page UI
  return (
    <div className="election-page">
      <h1 className="election-title">{electionData.electionTitle}</h1>
      <p className="election-description">{electionData.electionDescription}</p>
      <h2 className="candidates-header">Candidates:</h2>
      <div className="candidates-container">
        {electionData.candidates.map((candidate) => (
          <div className="candidate-card" key={candidate.id}>
            <h3 className="candidate-name">{candidate.fullName}</h3>
            <p className="eligibility-description">{candidate.eligibilityDescription}</p>
            {candidate.img && <img src={candidate.img} alt={candidate.fullName} className="candidate-image" />}
            <button className="vote-button" onClick={() => setSelectedCandidate(candidate)}>Vote</button>
          </div>
        ))}
      </div>
      <button 
        className="submit-vote-button" 
        onClick={handleVote} 
        disabled={!selectedCandidate} // Disable button if no candidate is selected
      >
        Submit Vote
      </button>
    </div>
  );
};

export default ElectionPage;