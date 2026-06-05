import { useState, useEffect } from 'react';
import { events as mockEvents } from '../../data/mockData';
import EventCard from './EventCard';
import CategoryFilter from '../Common/CategoryFilter';

function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 300);
  }, []);

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory);

  

  return (
    <div className="event-list-container">
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      
      <div className="events-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <p className="no-events">No events found in this category.</p>
        )}
      </div>
    </div>
  );
}

export default EventList;
