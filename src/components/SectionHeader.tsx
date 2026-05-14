import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, actions }) => (
  <div className="section-header">
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
    {actions ? <div className="section-actions">{actions}</div> : null}
  </div>
);

export default SectionHeader;
