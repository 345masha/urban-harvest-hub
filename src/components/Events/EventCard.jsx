import { useNavigate } from 'react-router-dom';
import './EventCard.css';

function EventCard({ event }) {
  const navigate = useNavigate();

  return (
    <div className="event-card">
      <div className="event-image">
        <img src={event.image} alt={event.title} width="400" height="300" loading="lazy" />
        <span className="event-category">{event.category}</span>
      </div>
      <div className="event-info">
        <h3>{event.title}</h3>
        <p className="event-description">{event.description}</p>
        
        <div className="event-details">
          <div className="detail-item">
            <span className="icon">📅</span>
            <span>{event.date}</span>
          </div>
          <div className="detail-item">
            <span className="icon">⏰</span>
            <span>{event.time}</span>
          </div>
          <div className="detail-item">
            <span className="icon">📍</span>
            <span>{event.location}</span>
          </div>
          <div className="detail-item">
            <span className="icon">👥</span>
            <span>{event.spots} spots available</span>
          </div>
        </div>

        <div className="event-footer">
          <span className="event-price">
            {event.price === 0 ? 'FREE' : `$${event.price}`}
          </span>
          <button 
            className="btn-register"
            onClick={() => navigate(`/events/${event.id}`)}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
