import React from 'react';
import { Outlet }       from 'react-router-dom';
import Navbar           from '../components/Navbar';
import Footer           from '../components/Footer';
import CartDrawer       from '../components/CartDrawer';
import WhatsAppButton   from '../components/WhatsAppButton';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-dark-500 flex flex-col">
      <Navbar />
      <CartDrawer />
      <main className="flex-1 pt-[104px] md:pt-[120px]">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}