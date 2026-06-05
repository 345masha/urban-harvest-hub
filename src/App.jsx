
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import LoadingSpinner from './components/Common/LoadingSpinner';

const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const WorkshopsPage = lazy(() => import('./pages/WorkshopsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const ProductDetails = lazy(() => import('./components/Products/ProductDetails'));
const WorkshopDetail = lazy(() => import('./components/Workshops/WorkshopDetail'));
const EventDetails = lazy(() => import('./components/Events/EventDetails'));
const Dashboard = lazy(() => import('./pages/Admin/Dashboard'));


function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>   
            <Route path="/" element={<HomePage />} />
            <Route path="/booking" element={<BookingPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/workshops" element={<WorkshopsPage />} />
            <Route path="/workshops/:id" element={<WorkshopDetail />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/admin" element={<Dashboard />} />
        
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router> 
  );
}

export default App;