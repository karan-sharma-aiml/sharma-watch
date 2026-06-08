import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiMessageCircle, FiArrowRight } from 'react-icons/fi';
import { BiCategory } from 'react-icons/bi';
import { productsAPI, categoriesAPI, ordersAPI, contactAPI } from '../../services/api';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

function StatCard({ icon: Icon, label, value, color, to }) {
  return (
    <Link
      to={to}
      className="group bg-dark-300 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all hover:-translate-y-0.5 card-shadow"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={20} />
      </div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="font-serif text-3xl font-bold text-white mt-1">{value}</p>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats,   setStats]   = useState({ products: 0, categories: 0, orders: 0, contacts: 0 });
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productsAPI.getAll({ limit: 1 }),
      categoriesAPI.getAll(),
      ordersAPI.getAll({ limit: 5 }),
      contactAPI.getAll({ limit: 1 }),
    ])
      .then(([pRes, cRes, oRes, ctRes]) => {
        setStats({
          products:   pRes.data.data.pagination?.totalProducts || 0,
          categories: cRes.data.data.categories?.length        || 0,
          orders:     oRes.data.data.pagination?.totalOrders   || 0,
          contacts:   ctRes.data.data.pagination?.total        || 0,
        });
        setOrders(oRes.data.data.orders || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={FiPackage}      label="Total Products"   value={stats.products}   color="bg-blue-400/10 text-blue-400"  to="/admin/products" />
        <StatCard icon={BiCategory}     label="Categories"       value={stats.categories} color="bg-purple-400/10 text-purple-400" to="/admin/categories" />
        <StatCard icon={FiShoppingBag}  label="Total Orders"     value={stats.orders}     color="bg-gold-400/10 text-gold-400"  to="/admin/orders" />
        <StatCard icon={FiMessageCircle} label="Contact Messages" value={stats.contacts}  color="bg-green-400/10 text-green-400" to="/admin/contacts" />
      </div>

      {/* Recent Orders */}
      <div className="bg-dark-300 border border-white/5 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold text-sm">Recent Orders</h2>
          <Link to="/admin/orders" className="flex items-center gap-1.5 text-gold-400 text-xs hover:text-gold-300 transition-colors">
            View All <FiArrowRight size={12} />
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm p-6 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-gray-500 text-xs border-b border-white/5">
                  <th className="text-left px-6 py-3">Order ID</th>
                  <th className="text-left px-6 py-3">Customer</th>
                  <th className="text-left px-6 py-3">Amount</th>
                  <th className="text-left px-6 py-3">Status</th>
                  <th className="text-left px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-white/5 hover:bg-white/2 transition-colors last:border-0">
                    <td className="px-6 py-3.5 text-gray-300 text-xs font-mono">
                      #{o._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-3.5 text-white text-sm">{o.user?.name || '—'}</td>
                    <td className="px-6 py-3.5 text-gold-400 text-sm font-semibold">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-gray-400 text-xs">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}