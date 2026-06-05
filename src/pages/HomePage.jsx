
import { useNavigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const WeatherWidget = lazy(() => import('../components/UI/WeatherWidget'));
const PushNotificationBtn = lazy(() => import('../components/UI/PushNotificationBtn'));
const InstallPWABtn = lazy(() => import('../components/UI/InstallPWABtn'));

function HomePage() {
  const navigate = useNavigate();

  const featuredProducts = [
    { id: 1, name: 'Bamboo Toothbrush', price: '$4.99', image: '/p1.jpg' },
    { id: 2, name: 'Reusable Bags', price: '$12.99', image: '/p2.jpg' },
    { id: 4, name: 'Solar Charger', price: '$39.99', image: '/p3.jpg' }
  ];

  const benefits = [
    { icon: '🌱', title: 'Eco-Friendly', description: 'All products are sustainably sourced' },
    { icon: '♻️', title: 'Reusable', description: 'Reduce waste with long-lasting products' },
    { icon: '🌍', title: 'Sustainable', description: 'Protect our planet for future generations' },
    { icon: '📦', title: 'Quality', description: 'Premium eco-conscious products' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">

      {/* Hero Section */}
      <section className="relative text-center py-24 bg-gradient-to-r from-green-400 to-green-600 dark:from-gray-800 dark:to-gray-900 text-white">
        <div className="absolute inset-0 opacity-20"></div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Urban Harvest Hub
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Join us in creating a sustainable future
          </p>

          <button
            className="bg-white text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
            onClick={() => navigate('/products')}
          >
            Explore Now
          </button>
        </div>
      </section>

      {/* Floating Action Controls */}
      <div className="fixed bottom-6 left-6 z-40 flex flex-col gap-3">
        <Suspense fallback={null}>
          <InstallPWABtn />
          <PushNotificationBtn />
        </Suspense>
      </div>

      {/* Weather Section */}
      <section className="py-8 px-6 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <Suspense fallback={<div className="h-64 md:max-w-4xl mx-auto rounded-2xl animate-pulse bg-slate-200 dark:bg-slate-800"></div>}>
          <WeatherWidget />
        </Suspense>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-10">Why Choose Us?</h2>

          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="text-3xl mb-3">{b.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{b.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-6 bg-gray-100 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            Featured Products
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  width="400"
                  height="300"
                  loading="lazy"
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  <p className="text-green-600 font-bold">{p.price}</p>

                  <button
                    onClick={() => navigate(`/products/${p.id}`)}
                    className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
              onClick={() => navigate('/products')}
            >
              See All Products
            </button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">
            Join Our Community Events
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-10">
            Meet like-minded people and make a difference together
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
              <img src="/p12.jpg" alt="Beach Cleanup" width="400" height="300" loading="lazy" className="h-56 w-full object-cover" />

              <div className="p-4">
                <h3 className="font-semibold text-lg">Beach Cleanup Day</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Help remove plastic waste from our beaches
                </p>

                <button
                  onClick={() => navigate('/events')}
                  className="mt-3 text-green-600 font-semibold"
                >
                  Learn More →
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
              <img src="/p11.jpg" alt="Tree Planting" width="400" height="300" loading="lazy" className="h-56 w-full object-cover" />

              <div className="p-4">
                <h3 className="font-semibold text-lg">Tree Planting Festival</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Plant native trees and restore our forests
                </p>

                <button
                  onClick={() => navigate('/events')}
                  className="mt-3 text-green-600 font-semibold"
                >
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center bg-green-600 dark:bg-gray-800 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Make a Difference?
        </h2>
        <p className="mb-6">
          Start your journey towards sustainable living today
        </p>

        <div className="flex justify-center gap-4">
          <button
            className="bg-white text-green-700 px-6 py-3 rounded-lg font-semibold"
            onClick={() => navigate('/products')}
          >
            Shop Now
          </button>

          <button
            className="border border-white px-6 py-3 rounded-lg"
            onClick={() => navigate('/events')}
          >
            Join Events
          </button>
        </div>
      </section>

    </div>
  );
}

export default HomePage;