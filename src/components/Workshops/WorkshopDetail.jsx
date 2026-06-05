import { useParams, useNavigate } from 'react-router-dom';
import { workshops } from '../../data/mockData';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export default function WorkshopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const workshop = workshops.find(w => w.id === parseInt(id));

  if (!workshop) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-lg">{t('noResults')}</p>
        <button
          onClick={() => navigate('/workshops')}
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
        onClick={() => navigate('/workshops')}
        className="btn-outline mb-6"
      >
        ← {t('back')}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div className="flex items-center justify-center">
          <img
            src={workshop.image}
            alt={workshop.title}
            width="800"
            height="600"
            className="w-full rounded-lg shadow-lg object-cover"
            role="img"
            aria-label={`${workshop.title} image`}
          />
        </div>

        {/* Content Section */}
        <div className="flex flex-col">
          <h1 className="text-4xl font-bold mb-2">{workshop.title}</h1>
          
          <div className="flex items-center gap-2 mb-4">
            <span className="badge">{workshop.category}</span>
            <span className="text-yellow-400">★ {workshop.rating}</span>
          </div>

          <p className="text-lg mb-4 text-gray-600 dark:text-gray-400">
            {workshop.description}
          </p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-semibold">📅 {t('date')}:</span>
              <span>{new Date(workshop.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">🕐 {t('time')}:</span>
              <span>{workshop.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">📍 {t('location')}:</span>
              <span>{workshop.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">👨‍🏫 {t('instructor')}:</span>
              <span>{workshop.instructor}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">💰 {t('price')}:</span>
              <span className="text-2xl text-eco-green-600">${workshop.price}</span>
            </div>
          </div>

          <p className="mb-6 text-gray-700 dark:text-gray-300">
            {workshop.fullDescription}
          </p>

          <div className="mb-6">
            <p className="text-sm text-gray-500">
              {workshop.spots} {t('spots')} {t('available')}
            </p>
            <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2 mt-2">
              <div
                className="bg-eco-green-600 h-2 rounded-full"
                style={{ width: `${(workshop.spots / 20) * 100}%` }}
              />
            </div>
          </div>

          <button
            className="btn-primary w-full"
            onClick={() => navigate('/booking')}
            aria-label={`Book ${workshop.title}`}
          >
            {t('bookNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
