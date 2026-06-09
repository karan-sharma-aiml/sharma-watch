import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiMessageCircle, FiArrowRight } from 'react-icons/fi';
import { BiCategory } from 'react-icons/bi';
import { productsAPI, categoriesAPI, ordersAPI, contactAPI } from '../../services/api';
import { formatPrice, formatDate, getStatusColor } from '../../utils/helpers';
import StatCard from '../../components/admin/StatCard';
import ChartCard from '../../components/admin/ChartCard';
import OrderBadge from '../../components/admin/OrderBadge';
import SectionHeader from '../../components/admin/SectionHeader';
import SkeletonCard from '../../components/admin/SkeletonCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, contacts: 0 });
  const [orders, setOrders] = useState([]);
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
          products: pRes.data.data.pagination?.totalProducts || 0,
          categories: cRes.data.data.categories?.length || 0,
          orders: oRes.data.data.pagination?.totalOrders || 0,
          contacts: ctRes.data.data.pagination?.total || 0,
        });
        setOrders(oRes.data.data.orders || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in space-y-6">
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <SkeletonCard className="h-44" lines={4} />
          <SkeletonCard className="h-44" lines={4} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
          <SkeletonCard lines={3} />
        </div>
        <SkeletonCard className="h-[420px]" lines={6} />
      </div>
    );
  }

  const averageOrderValue = orders.length
    ? Math.round(orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) / orders.length)
    : 0;

  return (
    <div className="animate-fade-in space-y-10">
      <section className="rounded-[32px] border border-white/10 bg-dark-400/80 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-gold-300/80">Admin Overview</p>
            <h1 className="mt-4 text-4xl font-serif font-bold text-white">Luxury Store Intelligence</h1>
            <p className="mt-3 max-w-2xl text-gray-400">A premium snapshot of your store performance, tailored for elegant administration and fast decision-making.</p>
          </div>
          <Link
            to="/admin/orders"
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gold-400 px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-gold-300"
          >
            View Orders <FiArrowRight size={16} />
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          <StatCard
            icon={FiPackage}
            label="Total Products"
            value={stats.products}
            to="/admin/products"
            accent="from-gold-400/20 via-white/5 to-black"
          />
          <StatCard
            icon={BiCategory}
            label="Categories"
            value={stats.categories}
            to="/admin/categories"
            accent="from-white/10 via-gold-400/10 to-black"
          />
          <StatCard
            icon={FiShoppingBag}
            label="Total Orders"
            value={stats.orders}
            to="/admin/orders"
            accent="from-gold-400/20 via-white/5 to-black"
          />
          <StatCard
            icon={FiMessageCircle}
            label="Contact Messages"
            value={stats.contacts}
            to="/admin/contacts"
            accent="from-white/10 via-gold-400/10 to-black"
          />
        </div>

        <ChartCard
          title="Order Activity"
          value={`${stats.orders} Orders`}
          detail="Latest 5 submissions"
        >
          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Latest Order</p>
              <p className="mt-3 text-xl font-semibold text-white">{orders[0]?.user?.name || 'No recent orders'}</p>
              <p className="mt-2 text-sm text-gray-400">{orders[0] ? formatDate(orders[0].createdAt) : '—'}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[28px] border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Average Order</p>
                <p className="mt-3 text-2xl font-semibold text-gold-300">{formatPrice(averageOrderValue)}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Latest Status</p>
                <div className="mt-3">
                  {orders[0] ? <OrderBadge status={orders[0].status} /> : <span className="text-gray-400">No status yet</span>}
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="space-y-6">
        <SectionHeader
          title="Recent Orders"
          description="A curated view of your latest premium transactions."
          actionLabel="View all orders"
          actionTo="/admin/orders"
          icon={FiShoppingBag}
        />

        {orders.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-dark-300 p-8 text-center text-gray-400">No orders available yet.</div>
        ) : (
          <div className="rounded-[32px] border border-white/10 bg-dark-300 p-4">
            <div className="grid gap-4 lg:hidden">
              {orders.map((order) => (
                <Link
                  key={order._id}
                  to="/admin/orders"
                  className="group block rounded-[28px] border border-white/10 bg-dark-500 p-5 transition-all hover:-translate-y-0.5 hover:border-gold-400/30"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-mono uppercase tracking-[0.24em] text-gray-500">#{order._id.slice(-8).toUpperCase()}</p>
                      <OrderBadge status={order.status} />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Customer</p>
                        <p className="mt-1 text-sm font-semibold text-white">{order.user?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-gray-500">Amount</p>
                        <p className="mt-1 text-sm font-semibold text-gold-300">{formatPrice(order.totalAmount)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-400">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="text-xs uppercase tracking-[0.22em] text-gray-500">{order.products?.length || 0} items</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.24em] text-gray-500">
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id} className="border-b border-white/5 transition-colors hover:bg-white/5 last:border-0">
                      <td className="px-6 py-5 text-xs font-mono text-gray-300">#{order._id.slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-5 text-sm font-semibold text-white">{order.user?.name || 'Unknown'}</td>
                      <td className="px-6 py-5 text-sm font-semibold text-gold-300">{formatPrice(order.totalAmount)}</td>
                      <td className="px-6 py-5">
                        <OrderBadge status={order.status} />
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-400">{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
