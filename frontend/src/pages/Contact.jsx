import React, { useState } from 'react';
import { FiSend, FiUser, FiMail, FiFileText, FiMessageSquare } from 'react-icons/fi';
import { HiOutlinePhone, HiOutlineLocationMarker, HiOutlineMail } from 'react-icons/hi';
import { contactAPI } from '../services/api';
import { useToast }   from '../context/ToastContext';

export default function Contact() {
  const { addToast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name    = 'Name is required.';
    if (!form.email.trim())    e.email   = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email.';
    if (!form.subject.trim())  e.subject = 'Subject is required.';
    if (!form.message.trim())  e.message = 'Message is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await contactAPI.submit(form);
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      addToast('Message sent! We\'ll get back to you soon.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to send message.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inp = (field) => ({
    value: form[field],
    onChange: (e) => { setForm((f) => ({ ...f, [field]: e.target.value })); setErrors((er) => ({ ...er, [field]: '' })); },
  });

  const fieldCls = (err) =>
    `w-full bg-dark-300 border text-white text-sm rounded-xl placeholder-gray-500 outline-none transition-colors px-4 py-3 ${
      err ? 'border-red-500/50' : 'border-white/8 focus:border-gold-400/50'
    }`;

  return (
    <div className="min-h-screen bg-dark-500 pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-gold-400 text-xs font-semibold tracking-[0.3em] uppercase mb-3">
            Get In Touch
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
            Have a question about a watch, an order, or anything else? We're here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-4">
            {[
              {
                icon: HiOutlineLocationMarker,
                title: 'Visit Us',
                lines: ['Sharma Watch Store, Near Ghantaghar Birgunj, Nepal', '44300'],
              },
              {
                icon: HiOutlinePhone,
                title: 'Call Us',
                lines: ['+977 9827286613'],
              },
              {
                icon: HiOutlineMail,
                title: 'Email Us',
                lines: ['sharmawatchstore@gmail.com'],
              },
            ].map(({ icon: Icon, title, lines }) => (
              <div key={title} className="glass gold-border rounded-2xl p-5 hover:border-gold-400/40 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center shrink-0">
                    <Icon className="text-gold-400" size={18} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold mb-1">{title}</p>
                    {lines.map((l) => <p key={l} className="text-gray-400 text-xs">{l}</p>)}
                  </div>
                </div>
              </div>
            ))}

            {/* Hours */}
            <div className="glass gold-border rounded-2xl p-5">
              <p className="text-white text-sm font-semibold mb-3">Store Hours</p>
              <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex justify-between"><span>Monday - Saturday</span><span className="text-white">9:30 AM - 8:00 PM</span></div>
                <div className="flex justify-between"><span>Sunday</span><span className="text-white">10:00 AM - 7:30 PM</span></div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="glass gold-border rounded-3xl p-8 card-shadow">
              {sent && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                  <p className="text-green-400 font-medium text-sm">✓ Message sent successfully!</p>
                  <p className="text-gray-400 text-xs mt-1">We'll respond within 24 hours.</p>
                  <button onClick={() => setSent(false)} className="text-gold-400 text-xs mt-2 hover:text-gold-300">Send another</button>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Your Name</label>
                    <div className={`flex items-center bg-dark-300 border rounded-xl overflow-hidden transition-colors ${errors.name ? 'border-red-500/50' : 'border-white/8 focus-within:border-gold-400/50'}`}>
                      <FiUser className="text-gray-500 ml-4 shrink-0" size={15} />
                      <input type="text" placeholder="John Doe" {...inp('name')}
                        className="flex-1 bg-transparent px-3 py-3 text-white text-sm placeholder-gray-500 outline-none" />
                    </div>
                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                    <div className={`flex items-center bg-dark-300 border rounded-xl overflow-hidden transition-colors ${errors.email ? 'border-red-500/50' : 'border-white/8 focus-within:border-gold-400/50'}`}>
                      <FiMail className="text-gray-500 ml-4 shrink-0" size={15} />
                      <input type="email" placeholder="you@example.com" {...inp('email')}
                        className="flex-1 bg-transparent px-3 py-3 text-white text-sm placeholder-gray-500 outline-none" />
                    </div>
                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Subject</label>
                  <div className={`flex items-center bg-dark-300 border rounded-xl overflow-hidden transition-colors ${errors.subject ? 'border-red-500/50' : 'border-white/8 focus-within:border-gold-400/50'}`}>
                    <FiFileText className="text-gray-500 ml-4 shrink-0" size={15} />
                    <input type="text" placeholder="How can we help?" {...inp('subject')}
                      className="flex-1 bg-transparent px-3 py-3 text-white text-sm placeholder-gray-500 outline-none" />
                  </div>
                  {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Message</label>
                  <textarea
                    rows={6}
                    placeholder="Tell us more about your inquiry…"
                    {...inp('message')}
                    className={`${fieldCls(errors.message)} resize-none`}
                  />
                  {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gold-400 text-black text-sm font-bold rounded-xl hover:bg-gold-300 transition-all disabled:opacity-50 shadow-lg shadow-gold-400/15"
                >
                  <FiSend size={15} />
                  {loading ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}