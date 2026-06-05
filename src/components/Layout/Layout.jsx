
import Header from './Header';
import Footer from './Footer';
import './Layout.css';

function Layout({ children }) {
  return (
    <div className="layout">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="main-content" role="main" tabIndex="-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default Layout;