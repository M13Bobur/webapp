import { useEffect, useState } from 'react';
import { api, getImageUrl } from '../api/axios';
import { Button, Input, Modal, Badge, PageShell } from '../components/ui';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', sortOrder: 0, isActive: true });
  const [image, setImage] = useState(null);

  const load = async () => {
    const res = await api.get('/categories');
    setCategories(res.data.data || []);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('sortOrder', form.sortOrder);
    fd.append('isActive', form.isActive);
    if (image) fd.append('image', image);

    if (editing) {
      await api.put(`/categories/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Xatolik');
    }
  };

  return (
    <PageShell
      title="Kategoriyalar"
      action={
        <Button
          className="w-full sm:w-auto"
          onClick={() => { setEditing(null); setForm({ title: '', sortOrder: 0, isActive: true }); setModalOpen(true); }}
        >
          + Yangi kategoriya
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat._id} className="rounded-xl bg-white border p-4 flex gap-4">
            <div className="h-16 w-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
              {cat.image && <img src={getImageUrl(cat.image)} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{cat.title}</h3>
              <p className="text-xs text-gray-500">Tartib: {cat.sortOrder}</p>
              <Badge color={cat.isActive ? 'green' : 'red'}>{cat.isActive ? 'Faol' : 'Nofaol'}</Badge>
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => { setEditing(cat); setForm({ title: cat.title, sortOrder: cat.sortOrder, isActive: cat.isActive }); setModalOpen(true); }}>
                  Tahrirlash
                </Button>
                <Button variant="danger" className="!px-2 !py-1 text-xs" onClick={() => handleDelete(cat._id)}>O'chirish</Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Tahrirlash' : 'Yangi kategoriya'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nomi" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Tartib" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Faol
          </label>
          <div>
            <label className="text-sm font-medium">Rasm</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="mt-1 text-sm" />
          </div>
          <Button type="submit" className="w-full">Saqlash</Button>
        </form>
      </Modal>
    </PageShell>
  );
}
