import { Card } from '../components/ui';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const admin = useAuthStore((s) => s.admin);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Sozlamalar</h1>
      <div className="max-w-xl space-y-6">
        <Card title="Hisob ma'lumotlari">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Telefon</dt>
              <dd className="font-medium">{admin?.phone}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Ism</dt>
              <dd className="font-medium">{admin?.name || 'Admin'}</dd>
            </div>
          </dl>
        </Card>
        <Card title="Telegram integratsiyasi">
          <p className="text-sm text-gray-600">
            Yangi buyurtmalar admin Telegram chatiga yuboriladi. Backend <code className="bg-gray-100 px-1 rounded">.env</code> faylida <code className="bg-gray-100 px-1 rounded">ADMIN_TELEGRAM_CHAT_ID</code> ni sozlang.
          </p>
        </Card>
        <Card title="Socket.IO">
          <p className="text-sm text-gray-600">
            Realtime buyurtma bildirishnomalari avtomatik ishlaydi. Yangi buyurtma kelganda ovozli signal chalinadi.
          </p>
        </Card>
      </div>
    </div>
  );
}
