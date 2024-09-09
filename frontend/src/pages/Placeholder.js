import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../Styling.css';

const Placeholder = () => {
  const [policyholders, setPolicyholders] = useState([]);
  const [policyholderId, setPolicyholderId] = useState('');
  const [name, setName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [selectedRow] = useState(null);
  const [updatingPolicyholderId, setUpdatingPolicyholderId] = useState(null);

  const getToken = () => localStorage.getItem('token');

  const fetchPolicyholders = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/policyholders', {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setPolicyholders(response.data);
    } catch (error) {
      toast.error('Failed to fetch policyholders.');
    }
  }, []); // Add any dependencies if needed

  useEffect(() => {
    fetchPolicyholders();
  }, [fetchPolicyholders]); // Use fetchPolicyholders in dependency array

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate contact number length
    if (contactNo.length !== 10) {
      toast.error('Contact number must be exactly 10 digits.');
      return;
    }

    // Convert the dateOfBirth to YYYY-MM-DD format for saving in the database
    const formattedDateOfBirth = moment(dateOfBirth).format('YYYY-MM-DD');

    const newPolicyholder = {
      policyholderId,
      name,
      contactNo,
      dateOfBirth: formattedDateOfBirth,
    };

    try {
      if (updatingPolicyholderId) {
        // Update existing policyholder
        const response = await axios.put(`http://localhost:5000/api/policyholders/${updatingPolicyholderId}`, newPolicyholder, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const updatedPolicyholder = response.data;
        const updatedPolicyholders = policyholders.map(ph =>
          ph.policyholderId === updatedPolicyholder.policyholderId ? updatedPolicyholder : ph
        );
        setPolicyholders(updatedPolicyholders);
        toast.success('Policyholder updated successfully!');
      } else {
        // Add new policyholder
        const response = await axios.post('http://localhost:5000/api/policyholders', newPolicyholder, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        setPolicyholders([...policyholders, response.data]);
        toast.success('Policyholder added successfully!');
      }
      clearForm();
      setUpdatingPolicyholderId(null); // Reset updatingPolicyholderId after operation
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Failed to add/update policyholder.');
    }
  };

  const handleUpdateButtonClick = (policyholder) => {
    setUpdatingPolicyholderId(policyholder.policyholderId);
    setPolicyholderId(policyholder.policyholderId);
    setName(policyholder.name);
    setContactNo(policyholder.contactNo);
    setDateOfBirth(moment(policyholder.dateOfBirth, 'YYYY-MM-DD').toDate()); // Convert to Date object for DatePicker
  };

  const handleDelete = async (policyholderId) => {
    try {
      await axios.delete(`http://localhost:5000/api/policyholders/${policyholderId}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const updatedPolicyholders = policyholders.filter(ph => ph.policyholderId !== policyholderId);
      setPolicyholders(updatedPolicyholders);
      toast.success('Policyholder deleted successfully!');
    } catch (error) {
      console.error('Error deleting policyholder:', error);
      toast.error('Failed to delete policyholder.');
    }
  };

  const clearForm = () => {
    setPolicyholderId('');
    setName('');
    setContactNo('');
    setDateOfBirth(null);
    setUpdatingPolicyholderId(null);
  };

  const maxDate = moment().subtract(18, 'years').toDate(); // Calculate maximum date (18 years ago)

  return (
    <div className="container">
      <h3>New Policy Holder</h3>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="policyholderId">Policy Holder ID*:</label>
            <input
              type="text"
              id="policyholderId"
              value={policyholderId}
              onChange={(e) => setPolicyholderId(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Name*:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contactNo">Contact Number*:</label>
            <input
              type="text"
              id="contactNo"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              maxLength={10} // Restrict to 10 digits
              minLength={10}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth:</label>
            <DatePicker
              id="dateOfBirth"
              selected={dateOfBirth}
              onChange={(date) => setDateOfBirth(date)}
              dateFormat="dd/MM/yyyy"
              maxDate={maxDate} // Set the maximum date to 18 years ago
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={100}
              placeholderText="DD/MM/YYYY"
              required
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary style">
            Submit
          </button>
          {updatingPolicyholderId && (
            <button type="button" className="btn btn-success style mx-2" onClick={handleSubmit}>
              Update
            </button>
          )}
          <button type="button" className="btn btn-secondary style ml-2 mx-2" onClick={clearForm}>
            Clear
          </button>
        </div>
      </form>
      <hr />
      <h3>Policy Holders List</h3>
      <ToastContainer />
      <div className="policyholders-list">
        <div className="policyholders-header">
          <div>Holder ID</div>
          <div>Name</div>
          <div>Contact Number</div>
          <div>Date of Birth</div>
          <div>Actions</div>
        </div>
        {policyholders.map((policyholder, index) => (
          <div
            key={index}
            className={`policyholder-item ${selectedRow === index ? 'highlighted-row' : ''}`}
          >
            <div>{policyholder.policyholderId}</div>
            <div>{policyholder.name}</div>
            <div>{policyholder.contactNo}</div>
            <div>{moment(policyholder.dateOfBirth).format('DD/MM/YYYY')}</div>
            <div className="button-column">
              <button
                type="button"
                className="btn btn-success style"
                onClick={() => handleUpdateButtonClick(policyholder)}
              >
                <i className="fa-solid fa-pen-to-square" style={{ color:'#fff' }}></i>
              </button>
              <button
                onClick={() => handleDelete(policyholder.policyholderId)}
                className="btn btn-danger style"
              >
                <i className="fa-solid fa-trash-can" style={{ color:'#fff' }}></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Placeholder;
