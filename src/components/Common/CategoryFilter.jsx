
const categories = [
  { id: 'all', name: 'All', icon: '' },
  { id: 'food', name: 'Food', icon: '' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '' },
  { id: 'education', name: 'Education', icon: '' },
  { id: 'energy', name: 'Energy', icon: '' },
  { id: 'waste', name: 'Zero Waste', icon: '' }
];

function CategoryFilter({ activeCategory, onCategoryChange }) {
  return (
    <div className="category-filter" role="tablist" aria-label="Content categories">
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.id)}
          className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
          role="tab"
          aria-selected={activeCategory === category.id}
        >
          <span aria-hidden="true">{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  );
}

export default CategoryFilter;