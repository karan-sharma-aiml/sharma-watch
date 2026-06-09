import React, { useState } from 'react';
import { FiUpload, FiTrash2, FiSend } from 'react-icons/fi';
import { useToast } from '../../context/ToastContext';
import { notificationAPI } from '../../services/notificationAPI';

export default function AdminNotifications() {
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handlePublish = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      addToast('Title is required.', 'error');
      return;
    }
    if (!message.trim()) {
      addToast('Message is required.', 'error');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = null;

      if (imageFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await notificationAPI.uploadImage(formData);
        imageUrl = uploadRes.data.data.image?.secure_url || uploadRes.data.data.image?.url || null;
        setUploading(false);
      }

      await notificationAPI.create({
        title: title.trim(),
        message: message.trim(),
        image: imageUrl,
      });

      addToast('Notification published to all subscribers.', 'success');
      setTitle('');
      setMessage('');
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      addToast(err.response?.data?.message || 'Notification publish failed.', 'error');
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Notifications</h1>
        <p className="text-gray-400 text-sm mt-1 max-w-2xl">
          Create and publish targeted announcements for subscribed users. This panel sends in-app updates to all subscribers automatically.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-dark-300 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Publish notification</h2>
            <p className="text-gray-500 text-sm mt-1">Compose your update and send it instantly to subscribed users.</p>
          </div>

          <form onSubmit={handlePublish} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-300">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New limited edition watch launch"
                className="mt-3 w-full rounded-2xl border border-white/10 bg-dark-400 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-gold-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share a concise update that excites your customers."
                rows={6}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-dark-400 px-4 py-3 text-white placeholder-gray-500 outline-none transition-colors focus:border-gold-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-300">Optional image</label>
              <div className="mt-3 flex flex-col gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-white/15 bg-dark-400 px-4 py-4 text-sm text-gray-300 transition-colors hover:border-gold-400 hover:text-gold-300">
                  <FiUpload size={18} />
                  <span>{imageFile ? 'Change image' : 'Upload image'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                </label>

                {imagePreview && (
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30">
                    <img src={imagePreview} alt="Preview" className="h-52 w-full object-cover" />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-black/70 p-2 text-white hover:bg-black"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex items-center gap-2 rounded-2xl bg-gold-400 px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSend size={16} />
              {saving ? 'Publishing…' : 'Publish notification'}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-white/10 bg-dark-300 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
          <h3 className="text-lg font-semibold text-white">Guidelines</h3>
          <ul className="mt-4 space-y-3 text-sm text-gray-400">
            <li>• Use a clear title and a short message for better engagement.</li>
            <li>• Images are optional and enhance visual impact.</li>
            <li>• Every published notification is delivered to subscribed users as an in-app alert.</li>
            <li>• This page is available only to administrators.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
