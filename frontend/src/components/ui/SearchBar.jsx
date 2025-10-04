export const SearchBar = ({
  value,
  onChange,
  placeholder = 'ابحث...',
  showResults = false,
  resultsText = '',
  resultsCount = null,
  className = '',
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="relative max-w-md">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {/* Clear Button */}
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="مسح البحث"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {/* Search Results Info */}
      {showResults && value && (
        <p className="text-sm text-gray-600 mt-2">
          نتائج البحث عن: <span className="font-semibold">"{resultsText || value}"</span>
          {resultsCount !== null && (
            <span className="mr-2">({resultsCount} نتيجة)</span>
          )}
        </p>
      )}
    </div>
  );
};
