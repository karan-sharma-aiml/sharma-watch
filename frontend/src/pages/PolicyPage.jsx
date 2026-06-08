import React from 'react';
import { Link } from 'react-router-dom';

const policyContent = {
  'Privacy Policy': [
    'Sharma Watch Store respects your privacy and protects your personal data with care.',
    'We collect only the information needed to process orders, manage accounts, and improve your shopping experience.',
    'Your details are stored securely and never shared with third parties except for order fulfillment and legal requirements.',
  ],
  'Terms & Conditions': [
    'These terms govern your use of Sharma Watch Store and the purchase of products through our website.',
    'Orders are subject to availability, pricing, and our payment verification process.',
    'We reserve the right to update these terms with notice on our website.',
  ],
  'Return Policy': [
    'Returns are accepted within 15 days of delivery for eligible watches in original condition.',
    'Please keep all packaging and receipts to ensure a smooth return process.',
    'Our team is ready to help you with exchanges, refunds, or warranty support.',
  ],
  'Shipping Policy': [
    'We offer fast, secure shipping across Nepal with premium packaging for every order.',
    'Free shipping is available on orders above NPR 999.',
    'Orders are processed quickly and tracked until delivery for your peace of mind.',
  ],
};

export default function PolicyPage({ title }) {
  const content = policyContent[title] || [
    'Information about this policy is coming soon. Please check back later.',
  ];

  return (
    <div className="min-h-screen bg-dark-500 pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-gold-400 text-xs font-semibold tracking-[0.3em] uppercase mb-3">{title}</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white">{title}</h1>
        </div>

        <div className="glass gold-border rounded-3xl p-8 card-shadow">
          {content.map((line, index) => (
            <p key={index} className="text-gray-400 text-sm leading-relaxed mb-4">
              {line}
            </p>
          ))}
          <div className="mt-8">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-400 text-black text-sm font-semibold hover:bg-gold-300 transition-all duration-200"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
