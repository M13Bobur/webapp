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
    {title && <div className="border-b px-4 py-3 sm:px-6 sm:py-4"><h3 className="font-semibold">{title}</h3></div>}
    <div className="p-4 sm:p-6">{children}</div>
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

export const PageShell = ({ title, action, children, className = '' }) => (
  <div className={`p-4 sm:p-6 lg:p-8 ${className}`}>
    {(title || action) && (
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        {title && <h1 className="text-xl font-bold sm:text-2xl">{title}</h1>}
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    {children}
  </div>
);

export const Modal = ({ open, onClose, title, children, wide = false }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4">
      <div
        className={`flex max-h-[92dvh] w-full flex-col overflow-hidden bg-white shadow-xl sm:max-h-[90vh] sm:rounded-xl ${
          wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="pr-2 text-base font-semibold sm:text-lg">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Yopish"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

export const Pagination = ({ page, totalPages, onPageChange }) => (
  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
    <Button variant="secondary" className="flex-1 sm:flex-none" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
      Oldingi
    </Button>
    <span className="w-full text-center text-sm text-gray-600 sm:w-auto">{page} / {totalPages}</span>
    <Button variant="secondary" className="flex-1 sm:flex-none" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
      Keyingi
    </Button>
  </div>
);
