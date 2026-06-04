import { useEffect, useState, useCallback } from 'react';
import { api, getImageUrl } from '../api/axios';
import { Button, Input, Select, Modal, Badge, Pagination } from '../components/ui';

const emptyForm = {
  title: '', description: '', shortDescription: '', price: '',
  discountPrice: '', categoryId: '', stock: 100, preparationTime: 15,
  isAvailable: true, badges: [],
};

const emptyVariant = { name: '', price: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [useVariants, setUseVariants] = useState(false);
  const [variants, setVariants] = useState([{ ...emptyVariant }]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (search) params.set('search', search);
      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?${params}`),
        api.get('/categories'),
      ]);
      setProducts(prodRes.data.data || []);
      setPagination(prodRes.data.pagination || { page: 1, totalPages: 1 });
      setCategories(catRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => load(1), 400);
    return () => clearTimeout(t);
  }, [search, load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setUseVariants(false);
    setVariants([{ ...emptyVariant }]);
    setImages([]);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      title: product.title,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price,
      discountPrice: product.discountPrice || '',
      categoryId: product.categoryId?._id || product.categoryId,
      stock: product.stock,
      preparationTime: product.preparationTime,
      isAvailable: product.isAvailable,
      badges: product.badges || [],
    });
    const hasV = Array.isArray(product.variants) && product.variants.length > 0;
    setUseVariants(hasV);
    setVariants(
      hasV
        ? product.variants.map((v) => ({ name: v.name, price: v.price }))
        : [{ ...emptyVariant }]
    );
    setImages([]);
    setModalOpen(true);
  };

  const addVariantRow = () => setVariants((v) => [...v, { ...emptyVariant }]);

  const updateVariant = (index, field, value) => {
    setVariants((list) =>
      list.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeVariant = (index) => {
    setVariants((list) => (list.length > 1 ? list.filter((_, i) => i !== index) : list));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'badges') fd.append(k, JSON.stringify(v));
      else if (v !== '' && v !== null) fd.append(k, v);
    });

    if (useVariants) {
      const cleaned = variants
        .filter((v) => v.name.trim() && v.price !== '')
        .map((v) => ({ name: v.name.trim(), price: Number(v.price) }));
      if (cleaned.length === 0) {
        alert('Kamida bitta variant qo\'shing (nomi va narxi)');
        return;
      }
      fd.append('variants', JSON.stringify(cleaned));
      fd.append('price', String(Math.min(...cleaned.map((v) => v.price))));
      fd.delete('discountPrice');
    } else {
      fd.append('variants', JSON.stringify([]));
    }

    images.forEach((f) => fd.append('images', f));

    if (editing) {
      await api.put(`/products/${editing._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    } else {
      await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    setModalOpen(false);
    load(pagination.page);
  };

  const toggleAvailability = async (id) => {
    await api.patch(`/products/${id}/toggle-availability`);
    load(pagination.page);
  };

  const handleDelete = async (id) => {
    if (!confirm('O\'chirishni tasdiqlaysizmi?')) return;
    await api.delete(`/products/${id}`);
    load(pagination.page);
  };

  const toggleBadge = (badge) => {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(badge) ? f.badges.filter((b) => b !== badge) : [...f.badges, badge],
    }));
  };

  const formatPrice = (p) => {
    if (p.variants?.length) {
      const prices = p.variants.map((v) => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max
        ? `${min.toLocaleString()} so'm`
        : `${min.toLocaleString()} - ${max.toLocaleString()} so'm`;
    }
    return `${(p.discountPrice ?? p.price).toLocaleString()} so'm`;
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mahsulotlar</h1>
        <Button onClick={openCreate}>+ Yangi mahsulot</Button>
      </div>
      <Input placeholder="Qidirish..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64 mb-6" />

      {loading ? (
        <p>Yuklanmoqda...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p._id} className="rounded-xl bg-white border shadow-sm overflow-hidden">
              <div className="h-40 bg-gray-100">
                {p.images?.[0] && <img src={getImageUrl(p.images[0])} alt="" className="h-full w-full object-cover" />}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold">{p.title}</h3>
                  <Badge color={p.isAvailable ? 'green' : 'red'}>{p.isAvailable ? 'Mavjud' : 'Yo\'q'}</Badge>
                </div>
                <p className="text-orange-600 font-bold mt-1">
                  {p.variants?.length > 0 && <span className="text-xs font-normal text-gray-500">dan </span>}
                  {formatPrice(p)}
                </p>
                {p.variants?.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {p.variants.map((v) => v.name).join(' · ')}
                  </p>
                )}
                <div className="flex gap-1 mt-2">
                  {p.badges?.map((b) => <Badge key={b} color="purple">{b}</Badge>)}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => openEdit(p)}>Tahrirlash</Button>
                  <Button variant="ghost" className="!px-2 !py-1 text-xs" onClick={() => toggleAvailability(p._id)}>
                    {p.isAvailable ? 'O\'chirish' : 'Yoqish'}
                  </Button>
                  <Button variant="danger" className="!px-2 !py-1 text-xs" onClick={() => handleDelete(p._id)}>×</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={load} />

      <Modal wide open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nomi" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Input label="Qisqa tavsif" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          <textarea
            placeholder="Tavsif"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            rows={3}
          />

          <div className="rounded-lg border border-gray-200 p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useVariants}
                onChange={(e) => {
                  setUseVariants(e.target.checked);
                  if (!e.target.checked) setVariants([{ ...emptyVariant }]);
                }}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Variantlar bor (masalan: Kichik, O&apos;rta, Katta)</span>
            </label>
            <p className="text-xs text-gray-500">
              O&apos;chirilgan bo&apos;lsa — oddiy mahsulot: bitta narx kiritasiz.
            </p>

            {useVariants ? (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Variantlar va narxlari</p>
                {variants.map((v, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <Input
                      label={index === 0 ? 'Nomi' : undefined}
                      placeholder="Kichik"
                      value={v.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      className="flex-1"
                      required
                    />
                    <Input
                      label={index === 0 ? 'Narx' : undefined}
                      type="number"
                      placeholder="45000"
                      value={v.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      className="w-32"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="!px-2 shrink-0"
                      onClick={() => removeVariant(index)}
                      disabled={variants.length === 1}
                    >
                      ×
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" className="text-xs" onClick={addVariantRow}>
                  + Variant qo&apos;shish
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Input label="Narx" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
                <Input label="Chegirma narxi" type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
              </div>
            )}
          </div>

          <Select
            label="Kategoriya"
            options={[{ value: '', label: 'Tanlang' }, ...categories.map((c) => ({ value: c._id, label: c.title }))]}
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Zaxira" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <Input label="Tayyorlash (daq)" type="number" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium">Badges</label>
            <div className="flex gap-2 mt-1">
              {['new', 'hot', 'popular'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBadge(b)}
                  className={`rounded-full px-3 py-1 text-xs border ${form.badges.includes(b) ? 'bg-orange-600 text-white border-orange-600' : ''}`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Rasmlar</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setImages([...e.target.files])} className="mt-1 text-sm" />
          </div>
          <Button type="submit" className="w-full">Saqlash</Button>
        </form>
      </Modal>
    </div>
  );
}
