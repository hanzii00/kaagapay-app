import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-gradient-hero">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">ReliefConnect</span>
            </div>
            <p className="text-muted-foreground max-w-md mb-4">
              Connecting communities with relief resources during times of need. 
              Together, we can make a difference.
            </p>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <a href="mailto:help@reliefconnect.org" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                help@reliefconnect.org
              </a>
              <a href="tel:+1-800-RELIEF" className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                1-800-RELIEF
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/sites" className="hover:text-primary transition-colors">Relief Sites</Link>
              </li>
              <li>
                <Link to="/tasks" className="hover:text-primary transition-colors">Volunteer Tasks</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-primary transition-colors">Map View</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">Become a Volunteer</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">Emergency Guidelines</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Volunteer Training</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Donation Centers</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ReliefConnect. Making communities stronger together.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
