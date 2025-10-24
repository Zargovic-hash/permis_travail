// ============================================
// FICHIER 23: src/components/ui/Tabs.jsx
// ============================================
import React, { useState } from 'react';

export default function Tabs({ tabs, defaultTab = 0, onChange, className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    onChange?.(index);
  };

  return (
    <div className={className}>
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex gap-8" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => handleTabChange(index)}
              className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === index
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {tab.icon && <tab.icon className="w-5 h-5" />}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="py-0.5 px-2 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                    {tab.badge}
                  </span>
                )}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}

