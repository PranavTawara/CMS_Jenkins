import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styling.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

const Claims = () => {
  const [claims, setClaims] = useState([]);
  const [claimId, setClaimId] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDate, setClaimDate] = useState('');
  const [updatingClaimId, setUpdatingClaimId] = useState(null);
  const [selectedClaimIndex, setSelectedClaimIndex] = useState(null); // State for selected claim index
  const [policies, setPolicies] = useState([]); // State to store policies

  const getToken = () => localStorage.getItem('token');

  // Fetch claims and policies from backend
  const fetchClaims = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/claims', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setClaims(response.data);
    } catch (error) {
      toast.error('Failed to fetch claims.');
    }
  }, []);

  const fetchPolicies = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/policies', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPolicies(response.data);
    } catch (error) {
      toast.error('Failed to fetch policies.');
    }
  }, []);

  useEffect(() => {
    fetchClaims();
    fetchPolicies();
  }, [fetchClaims, fetchPolicies]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Find the policy with the provided policyId
    const selectedPolicy = policies.find(policy => policy.policyId === policyId);
    if (!selectedPolicy) {
      toast.error('Policy ID does not exist.');
      return;
    }

    // Check if claim amount exceeds policy amount
    if (parseFloat(claimAmount) > parseFloat(selectedPolicy.amount)) {
      toast.error('Claim Amount exceeds the Policy amount.');
      return;
    }

    const newClaim = {
      claimId,
      policyId,
      claimAmount: parseFloat(claimAmount), // Convert to number
      claimDate: claimDate ? moment(claimDate, 'DD/MM/YYYY').format('YYYY-MM-DD') : '',
    };

    try {
      if (updatingClaimId) {
        // Update existing claim
        await axios.put(`http://localhost:5000/api/claims/${updatingClaimId}`, newClaim, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const updatedClaims = claims.map(claim =>
          claim.claimId === updatingClaimId ? { ...claim, ...newClaim } : claim
        );
        setClaims(updatedClaims);
        toast.success('Claim updated successfully!');
      } else {
        // Add new claim
        const response = await axios.post('http://localhost:5000/api/claims', newClaim, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setClaims([...claims, response.data]);
        toast.success('Claim added successfully!');
      }
      clearForm();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Failed to save claim.');
    }
  };

  const handleUpdateButtonClick = (claim) => {
    setUpdatingClaimId(claim.claimId);
    setClaimId(claim.claimId);
    setPolicyId(claim.policyId);
    setClaimAmount(claim.claimAmount.toString());
    setClaimDate(moment(claim.claimDate, 'YYYY-MM-DD').format('DD/MM/YYYY'));
    setSelectedClaimIndex(claim.index); // Set selected index for highlighting
  };

  const handleDelete = async (index) => {
    const claim = claims[index];
    try {
      await axios.delete(`http://localhost:5000/api/claims/${claim.claimId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const updatedClaims = claims.filter((_, i) => i !== index);
      setClaims(updatedClaims);
      toast.success('Claim deleted successfully!');
    } catch (error) {
      console.error('Error deleting claim:', error);
      toast.error('Failed to delete claim.');
    }
  };

  const clearForm = () => {
    setClaimId('');
    setPolicyId('');
    setClaimAmount('');
    setClaimDate('');
    setUpdatingClaimId(null);
    setSelectedClaimIndex(null); // Reset selected claim index
  };

  return (
    <div className="container">
      <h3>Claims</h3>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="claimId">Claim ID*:</label>
            <input
              type="text"
              id="claimId"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="policyId">Policy ID*:</label>
            <input
              type="text"
              id="policyId"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="claimAmount">Claim Amount*:</label>
            <input
              type="number"
              id="claimAmount"
              value={claimAmount}
              onChange={(e) => setClaimAmount(e.target.value)}
              required
              style={{ width: '200px'}}
              min="0"
              max="1000000"
            />
          </div>
          <div className="form-group">
            <label>Claim Date*:</label>
            <DatePicker
              selected={claimDate ? moment(claimDate, 'DD/MM/YYYY').toDate() : null}
              onChange={date => setClaimDate(date ? moment(date).format('DD/MM/YYYY') : '')}
              dateFormat="dd/MM/yyyy"
              className="form-control datepicker"
              isClearable
              placeholderText="DD/MM/YYYY"
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary style mx-2">
            {updatingClaimId ? 'Update' : 'Submit'}
          </button>
          <button type="button" className="btn btn-secondary style ml-2" onClick={clearForm}>
            Clear
          </button>
        </div>
      </form>
      <hr />
      <h3>Claims List</h3>
      <ToastContainer />
      <div className="claims-list">
        <div className="claims-header">
          <div>Claim ID</div>
          <div>Policy ID</div>
          <div>Claim Amount</div>
          <div>Claim Date</div>
          <div>Actions</div>
        </div>
        {claims.map((claim, index) => (
          <div
            key={index}
            className={`claim-item ${selectedClaimIndex === index ? 'highlighted-row' : ''}`}
          >
            <div>{claim.claimId}</div>
            <div>{claim.policyId}</div>
            <div>{claim.claimAmount}</div>
            <div>{moment(claim.claimDate).format('DD/MM/YYYY')}</div>
            <div className="button-column">
              <button
                type="button"
                className="btn btn-success style"
                onClick={() => handleUpdateButtonClick(claim)}
              >
                <i className="fa-solid fa-pen-to-square" style={{ color: '#fff' }}></i>
              </button>
              <button
                type="button"
                className="btn btn-danger style"
                onClick={() => handleDelete(index)}
              >
                <i className="fa-solid fa-trash-can" style={{ color: '#fff' }}></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Claims;
