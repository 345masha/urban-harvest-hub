
import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import WorkshopCard from '../components/Workshops/WorkshopCard';
import CategoryFilter from '../components/Common/CategoryFilter';
import { workshopsAPI } from '../services/api';
import './WorkshopsPage.css';

function WorkshopsPage() {
  const { t } = useLanguage();
  const [workshops, setWorkshops] = useState([]);
  const [filteredWorkshops, setFilteredWorkshops] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('date');

  const loadWorkshops = async () => {
    setLoading(true);
    try {
      const data = await workshopsAPI.getAll(activeCategory, searchTerm);
      setWorkshops(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkshops();
  }, [activeCategory, searchTerm]);

  useEffect(() => {
    let filtered = workshops;

    if (activeCategory !== 'all') {
      filtered = filtered.filter(w => w.category === activeCategory);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(w =>
        w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    setFilteredWorkshops(filtered);
  }, [activeCategory, workshops, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-green-50 to-eco-sage-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-8" role="banner">
          <h1 className="text-4xl font-bold text-eco-green-800 dark:text-eco-green-100 mb-2">
            {t('ecoWorkshops')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('learnSkills')}
          </p>
        </header>

        {/* Search and Filter Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2">
            <input
              type="search"
              placeholder={`${t('search')} workshops...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-base flex-1"
              aria-label="Search workshops"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-base"
              aria-label="Sort workshops"
            >
              <option value="date">Sort by Date</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
          </div>

          <CategoryFilter 
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {/* Workshops Grid */}
        {loading ? (
          <div className="flex justify-center items-center min-h-96" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eco-green-600"></div>
            <span className="sr-only">{t('loading')}</span>
          </div>
        ) : filteredWorkshops.length > 0 ? (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Showing {filteredWorkshops.length} workshop{filteredWorkshops.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkshops.map(workshop => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12" role="status" aria-live="polite">
            <p className="text-xl text-gray-600 dark:text-gray-300">{t('noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkshopsPage;