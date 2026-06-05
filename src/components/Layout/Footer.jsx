
import './Footer.css';

function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Urban Harvest Hub</h3>
          <p>Making sustainability accessible for everyone</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/products">Products</a></li>
            <li><a href="/workshops">Workshops</a></li>
            <li><a href="/events">Events</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: hello@urbanharvest.com</p>
          <p>Phone: (555) 123-4567</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 Urban Harvest Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;