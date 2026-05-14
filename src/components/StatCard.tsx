import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  accent: 'primary' | 'success' | 'warning' | 'neutral';
  // optional extra content to show under the main value (e.g. stacked ratios)
  extra?: React.ReactNode;
}

const accentClass = {
  primary: 'stat-primary',
  success: 'stat-success',
  warning: 'stat-warning',
  neutral: 'stat-neutral'
};

const StatCard: React.FC<StatCardProps> = ({ label, value, accent, extra }) => (
  <div className={`stat-card ${accentClass[accent]}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {extra ? <div className="stat-sub">{extra}</div> : null}
  </div>
);

export default StatCard;
