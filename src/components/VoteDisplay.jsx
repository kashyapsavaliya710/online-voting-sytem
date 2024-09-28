import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

const VoteDisplay = () => {
  const { uniqueId } = useParams();
  const [electionData, setElectionData] = useState(null);
  
  useEffect(() => {
    const fetchElectionData = async () => {
      if (!uniqueId) {
        console.error("uniqueId is undefined");
        return; 
      }
      
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
              votes: candidate.votes || 0,
            })),
          });
        } else {
          console.log("No such election document!");
        }
      } catch (error) {
        console.error("Error fetching election data:", error);
      }
    };

    fetchElectionData();
  }, [uniqueId]);

  // Loading state
  if (!electionData) {
    return <div>Loading...</div>;
  }

  // Check for candidates
  if (electionData.candidates.length === 0) {
    return <div>No candidates found for this election.</div>;
  }

  return (
    <div>
      <h1>{electionData.electionTitle}</h1>
      <p>{electionData.electionDescription}</p>
      <h2>Vote Counts:</h2>
      {electionData.candidates.map((candidate, index) => (
        <div key={index}>
          <h3>{candidate.fullName}</h3>
          <p>Votes: {candidate.votes}</p>
        </div>
      ))}
    </div>
  );
};

export default VoteDisplay;
