import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaInstagram, FaFacebookF, FaTwitter, FaWhatsapp, FaYoutube,
} from 'react-icons/fa';
import {
  HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker,
} from 'react-icons/hi';

const quickLinks = [
  { to: '/',          label: 'Home'     },
  { to: '/products',  label: 'Products' },
  { to: '/wishlist',  label: 'Wishlist' },
  { to: '/cart',      label: 'Cart'     },
  { to: '/contact',   label: 'Contact'  },
];

const categories = [
  "Men's Watches",
  "Women's Watches",
  'Luxury Collection',
  'Sports Watches',
  'Smart Watches',
  'Vintage Watches',
];

const policyLinks = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms-conditions', label: 'Terms & Conditions' },
  { to: '/return-policy', label: 'Return Policy' },
  { to: '/shipping-policy', label: 'Shipping Policy' },
];

const socials = [
  { icon: FaInstagram, href: 'https://www.instagram.com/sharmawatchstore', label: 'Instagram' },
  { icon: FaFacebookF, href: 'https://www.facebook.com/share/18p98PBY2C/', label: 'Facebook' },
  { icon: FaTwitter,   href: '#', label: 'Twitter' },
  { icon: FaWhatsapp,  href: '#', label: 'WhatsApp' },
  { icon: FaYoutube,   href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-dark-400 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="font-serif text-3xl font-bold text-gradient-gold tracking-wider">SHARMA</h2>
              <p className="text-[9px] tracking-[0.3em] text-gray-500 uppercase font-medium mt-1">Watch Store</p>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Curating the finest timepieces for discerning customers since 2010.
              Every watch tells a story — let yours speak luxury.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-gold-400 font-semibold">Authenticity</p>
                <p className="text-gray-400 text-xs mt-1">Verified watches only</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-gold-400 font-semibold">Luxury Care</p>
                <p className="text-gray-400 text-xs mt-1">Premium packaging</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="text-gold-400 font-semibold">Trusted Support</p>
                <p className="text-gray-400 text-xs mt-1">Easy returns</p>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:bg-gold-400/10 hover:border-gold-400/30 transition-all duration-200"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-gold-400" />
              Business Hours
            </h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <p>Mon - Sat: 9:30 AM - 8:00 PM</p>
              <p>Sun: 10:00 AM - 7:30 PM</p>
              <p className="text-white text-xs uppercase tracking-[0.25em] mt-3">Closed on public holidays</p>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-gold-400" />
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-gray-400 text-sm hover:text-gold-300 transition-colors hover:translate-x-1 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-5 flex items-center gap-2">
              <span className="w-4 h-0.5 bg-gold-400" />
              Contact Info
            </h3>
            <ul className="space-y-4 text-gray-400 text-sm">
              <li className="flex items-start gap-3">
                <HiOutlineLocationMarker className="text-gold-400 mt-0.5 shrink-0" size={16} />
                <span>Sharma Watch Store, Near Ghanta Ghar, Birgunj — Nepal</span>
              </li>
              <li className="flex items-center gap-3">
                <HiOutlinePhone className="text-gold-400 shrink-0" size={16} />
                <a href="tel:+9779827286613" className="hover:text-gold-300 transition-colors">+977 9827286613</a>
              </li>
              <li className="flex items-center gap-3">
                <HiOutlineMail className="text-gold-400 shrink-0" size={16} />
                <a href="mailto:karanku1882@gmail.com" className="hover:text-gold-300 transition-colors">karanku1882@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-xs">© {new Date().getFullYear()} Sharma Watch Store. All rights reserved.</p>
          <p className="text-gray-600 text-xs">Crafted with ♥ for watch enthusiasts.</p>
        </div>
      </div>
    </footer>
  );
}