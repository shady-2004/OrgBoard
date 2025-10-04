export const SimplePieChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        لا توجد بيانات للعرض
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div>
      {title && <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>}
      <div className="flex items-center gap-6">
        {/* Simple donut chart using flexbox */}
        <div className="flex-shrink-0">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 100 100" className="transform -rotate-90">
              {data.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                const offset = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 100, 0);
                const circumference = 2 * Math.PI * 40;
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((offset / 100) * circumference);

                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={item.color || '#3B82F6'}
                    strokeWidth="20"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-800">{total.toLocaleString()}</div>
                <div className="text-xs text-gray-600">إجمالي</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {data.map((item, index) => {
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color || '#3B82F6' }}
                  />
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  {item.value.toLocaleString()} ({percentage}%)
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
