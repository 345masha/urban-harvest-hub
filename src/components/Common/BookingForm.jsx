
import { useState } from 'react';
import './BookingForm.css';

function BookingForm({ item, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    quantity: 1,
    specialRequests: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Simulate API call
      setTimeout(() => {
        setSubmitted(true);
        // Clear form after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      }, 1000);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (submitted) {
    return (
      <div className="booking-modal">
        <div className="modal-content success">
          <div className="success-icon">✓</div>
          <h2>Booking Confirmed!</h2>
          <p>Thank you for subscribing to {item.name}</p>
          <p>A confirmation email has been sent to <strong>{formData.email}</strong></p>
          <button onClick={onClose} className="btn-close">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-modal" role="dialog" aria-label="Booking form">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        
        <h2>Subscribe to {item.name}</h2>
        <p className="price-info">Price: ${item.price} per item</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.name}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              aria-required="true"
              aria-invalid={!!errors.email}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={formData.quantity}
              onChange={handleChange}
              aria-invalid={!!errors.quantity}
            />
            {errors.quantity && <span className="error-message">{errors.quantity}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="specialRequests">Special Requests (Optional)</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              rows="3"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="Any special instructions or questions?"
            />
          </div>
          
          <button type="submit" className="btn-submit">
            Confirm Subscription
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingForm;