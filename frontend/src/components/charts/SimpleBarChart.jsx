export const SimpleBarChart = ({ data, title, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        لا توجد بيانات للعرض
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div>
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
      <div className="flex items-end justify-between gap-2" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const barHeight = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col items-center justify-end" style={{ height: '100%' }}>
                <div className="text-xs font-semibold text-gray-700 mb-1">
                  {item.value.toLocaleString()}
                </div>
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${item.color || 'bg-blue-500'}`}
                  style={{ height: `${barHeight}%`, minHeight: item.value > 0 ? '20px' : '0' }}
                  title={`${item.label}: ${item.value}`}
                />
              </div>
              <div className="text-xs text-gray-600 text-center">{item.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
