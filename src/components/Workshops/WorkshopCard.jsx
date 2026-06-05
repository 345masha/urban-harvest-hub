
import { Link } from 'react-router-dom';

function WorkshopCard({ workshop }) {
  return (
    <article className="workshop-card">
      <div className="workshop-image">
        <img src={workshop.image} alt={workshop.title} width="400" height="300" loading="lazy" />
        <span className="workshop-date">{workshop.date}</span>
      </div>
      
      <div className="workshop-info">
        <h3>{workshop.title}</h3>
        <p className="workshop-description">{workshop.description}</p>
        
        <div className="workshop-meta">
          <span className="price">${workshop.price}</span>
          <span className="location">{workshop.location}</span>
        </div>
        
        <div className="workshop-spots">
          {workshop.spots} spots available
        </div>
        
        <Link 
          to={`/workshops/${workshop.id}`}
          className="btn-details"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

export default WorkshopCard;