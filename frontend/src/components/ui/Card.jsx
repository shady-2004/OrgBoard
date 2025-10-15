export const Card = ({ children, title, className = '', onClick }) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}
      onClick={onClick}
    >
      {title && <div className="px-6 py-4 border-b border-gray-200 font-semibold text-gray-800">{title}</div>}
      <div className="p-6">{children}</div>
    </div>
  );
};
