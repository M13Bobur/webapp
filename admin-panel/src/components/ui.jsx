export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-orange-600 text-white hover:bg-orange-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent hover:bg-gray-100',
  };
  return (
    <button
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({ label, className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
      {...props}
    />
  </div>
);

export const Select = ({ label, options = [], className = '', ...props }) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select
      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
      {...props}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

export const Card = ({ title, children, className = '' }) => (
  <div className={`rounded-xl bg-white shadow-sm border border-gray-100 ${className}`}>
    {title && <div className="border-b px-6 py-4"><h3 className="font-semibold">{title}</h3></div>}
    <div className="p-6">{children}</div>
  </div>
);

export const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};

export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const Pagination = ({ page, totalPages, onPageChange }) => (
  <div className="flex items-center justify-center gap-2 mt-4">
    <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Oldingi</Button>
    <span className="text-sm text-gray-600">{page} / {totalPages}</span>
    <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Keyingi</Button>
  </div>
);
