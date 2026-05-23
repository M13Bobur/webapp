export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <span className="text-5xl mb-4">{icon}</span>
    <h3 className="text-lg font-semibold">{title}</h3>
    {description && <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
