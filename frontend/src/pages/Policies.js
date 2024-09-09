import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styling.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

const Policies = () => {
  const [policies, setPolicies] = useState([]);
  const [policyId, setPolicyId] = useState('');
  const [policyholderId, setPolicyholderId] = useState('');
  const [amount, setAmount] = useState('');
  const [premium, setPremium] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [claimedAmount, setClaimedAmount] = useState('');
  const [updatingPolicyId, setUpdatingPolicyId] = useState(null);

  const getToken = () => localStorage.getItem('token');

  // Fetch policies from backend
  const fetchPolicies = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/policies', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPolicies(response.data);
    } catch (error) {
      toast.error('Failed to fetch policies.');
    }
  }, []); // Empty dependency array ensures it runs only on mount

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if policyholderId exists
    const policyholderExists = await checkPolicyholderExists(policyholderId);

    if (!policyholderExists) {
      toast.error('Policy holder does not exist. Cannot create policy.');
      return;
    }

    const formattedStartDate = startDate ? moment(startDate).format('YYYY-MM-DD') : '';
    const formattedEndDate = endDate ? moment(endDate).format('YYYY-MM-DD') : '';

    const newPolicy = {
      policyId,
      policyholderId,
      amount,
      premium,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      claimedAmount: claimedAmount || 0,
    };

    try {
      if (updatingPolicyId) {
        // Update existing policy
        const response = await axios.put(`http://localhost:5000/api/policies/${updatingPolicyId}`, newPolicy, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const updatedPolicy = response.data;
        const updatedPolicies = policies.map(pol => (pol.policyId === updatedPolicy.policyId ? updatedPolicy : pol));
        setPolicies(updatedPolicies);
        toast.success('Policy updated successfully!');
      } else {
        // Add new policy
        const response = await axios.post('http://localhost:5000/api/policies', newPolicy, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setPolicies([...policies, response.data]);
        toast.success('Policy added successfully!');
      }
      clearForm();
      setUpdatingPolicyId(null); // Reset updatingPolicyId after operation
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Failed to add/update policy.');
    }
  };

  const checkPolicyholderExists = async (policyholderId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/policyholders/${policyholderId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      return !!response.data; // Returns true if policyholder with given ID exists
    } catch (error) {
      console.error('Error checking policyholder:', error);
      return false; // Handle error or policyholder not found
    }
  };

  const handleUpdateButtonClick = (policy) => {
    setUpdatingPolicyId(policy.policyId);
    setPolicyId(policy.policyId);
    setPolicyholderId(policy.policyholderId);
    setAmount(policy.amount);
    setPremium(policy.premium);
    setStartDate(moment(policy.startDate, 'YYYY-MM-DD').toDate());
    setEndDate(moment(policy.endDate, 'YYYY-MM-DD').toDate());
    setClaimedAmount(policy.claimedAmount);
  };

  const handleDelete = async (index) => {
    const policy = policies[index];
    try {
      await axios.delete(`http://localhost:5000/api/policies/${policy.policyId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const updatedPolicies = policies.filter((_, i) => i !== index);
      setPolicies(updatedPolicies);
      toast.success('Policy deleted successfully!');
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast.error('Failed to delete policy.');
    }
  };

  const clearForm = () => {
    setPolicyId('');
    setPolicyholderId('');
    setAmount('');
    setPremium('');
    setStartDate(null);
    setEndDate(null);
    setClaimedAmount('');
    setUpdatingPolicyId(null);
  };

  return (
    <div className="container">
      <h3>Policies</h3>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="policyId">Policy ID*:</label>
            <input
              type="text"
              id="policyId"
              value={policyId}
              onChange={(e) => setPolicyId(e.target.value)}
              required
              style={{ width: '200px' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="policyholderId">Policy Holder ID*:</label>
            <input
              type="text"
              id="policyholderId"
              value={policyholderId}
              onChange={(e) => setPolicyholderId(e.target.value)}
              required
              style={{ width: '200px' }}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="amount">Amount*:</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              max="1000000"
              required
              style={{ width: '200px' }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="premium">Premium*:</label>
            <input
              type="number"
              id="premium"
              value={premium}
              onChange={(e) => setPremium(e.target.value)}
              min="0"
              max="1000000"
              required
              style={{ width: '200px' }}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control datepicker"
              isClearable
              placeholderText="DD/MM/YYYY"
            />
          </div>
          <div className="form-group">
            <label>End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              dateFormat="dd/MM/yyyy"
              className="form-control datepicker"
              isClearable
              placeholderText="DD/MM/YYYY"
            />
          </div>
        </div>
        <button type="submit" className="btn btn-primary style">
          Submit
        </button>
        {updatingPolicyId && (
          <button type="button" className="btn btn-success style mx-2" onClick={handleSubmit}>
            Update
          </button>
        )}
        <button type="button" className="btn btn-secondary style ml-2 mx-2" onClick={clearForm}>
          Clear
        </button>
      </form>
      <hr />
      <h3>Policies List</h3>
      <ToastContainer />
      <div className="policies-list">
        <div className="policies-header">
          <div>Policy ID</div>
          <div>Holder ID</div>
          <div>Amount</div>
          <div>Premium</div>
          <div>Start Date</div>
          <div>End Date</div>
          <div>Claimed Amount</div>
          <div>Actions</div>
        </div>
        {policies.map((policy, index) => (
          <div key={index} className="policy-item">
            <div>{policy.policyId}</div>
            <div>{policy.policyholderId}</div>
            <div>{policy.amount}</div>
            <div>{policy.premium}</div>
            <div>{moment(policy.startDate).format('DD/MM/YYYY')}</div>
            <div>{moment(policy.endDate).format('DD/MM/YYYY')}</div>
            <div>{policy.claimedAmount}</div>
            <div className="button-column">
              <button type="button" className="btn btn-success style" onClick={() => handleUpdateButtonClick(policy)}>
                <i className="fa-solid fa-pen-to-square" style={{ color: '#fff' }}></i>
              </button>
              <button type="button" className="btn btn-danger style" onClick={() => handleDelete(index)}>
                <i className="fa-solid fa-trash-can" style={{ color: '#fff' }}></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Policies;
