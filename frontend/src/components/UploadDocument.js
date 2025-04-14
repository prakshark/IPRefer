import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './UploadDocument.css';

const UploadDocument = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [similarDocuments, setSimilarDocuments] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setSimilarDocuments([]);
  };

  const checkSimilarity = async (file) => {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('http://localhost:5000/api/ml/check-similarity', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.similarDocuments && response.data.similarDocuments.length > 0) {
        setSimilarDocuments(response.data.similarDocuments);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking similarity:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!file) {
        throw new Error('Please select a file');
      }

      // First check for similar documents
      const hasSimilar = await checkSimilarity(file);
      if (hasSimilar) {
        setLoading(false);
        return; // Don't proceed with upload if similar documents exist
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('owner', user._id);

      const response = await axios.post('http://localhost:5000/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Document</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Document</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        {similarDocuments.length > 0 && (
          <div className="similar-documents">
            <h3>Similar Documents Found</h3>
            <ul>
              {similarDocuments.map((doc, index) => (
                <li key={index}>
                  <p>Title: {doc.title}</p>
                  <p>Owner: {doc.owner}</p>
                  <p>Similarity: {(doc.similarity * 100).toFixed(2)}%</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
    </div>
  );
};

export default UploadDocument; 