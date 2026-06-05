import { useParams, useNavigate } from 'react-router-dom';
import { events } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const event = events.find(e => e.id === parseInt(id));

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-lg">{t('noResults')}</p>
        <button
          onClick={() => navigate('/events')}
          className="btn-primary mt-4"
        >
          {t('back')}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/events')}
        className="btn-outline mb-6"
      >
        ← {t('back')}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="flex items-center justify-center">
          <img
            src={event.image}
            alt={event.title}
            width="800"
            height="600"
            className="w-full rounded-lg shadow-lg object-cover"
            role="img"
            aria-label={`${event.title} image`}
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold mb-2">{event.title}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="badge">{event.category}</span>
            {event.price === 0 && <span className="text-eco-green-600 font-semibold">{t('free')}</span>}
          </div>

          <p className="text-lg mb-4 text-gray-600 dark:text-gray-400">
            {event.description}
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold">📅 {t('date')}:</span>
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">🕐 {t('time')}:</span>
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">📍 {t('location')}:</span>
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">🎯 {t('organizer')}:</span>
              <span>{event.organizer}</span>
            </div>
            {event.price > 0 && (
              <div className="flex items-center gap-2">
                <span className="font-semibold">💰 {t('price')}:</span>
                <span className="text-2xl text-eco-green-600">${event.price}</span>
              </div>
            )}
          </div>

          <p className="mb-6 text-gray-700 dark:text-gray-300">
            {event.fullDescription}
          </p>

          <div className="mb-6">
            <p className="text-sm text-gray-500">
              {event.spots} {t('spots')} {t('available')}
            </p>
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 mt-2">
              <div
                className="bg-eco-green-600 h-2 rounded-full"
                style={{ width: `${(event.spots / 100) * 100}%` }}
              />
            </div>
          </div>

          <button
            className="btn-primary w-full"
            onClick={() => navigate('/booking')}
            aria-label={`Register for ${event.title}`}
          >
            {t('registerNow')}
          </button>
        </div>
      </div>
    </div>
  );
}

