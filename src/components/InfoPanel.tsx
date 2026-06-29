import { ReactNode } from 'react';

interface InfoPanelProps {
  title: string;
  kicker?: string;
  children: ReactNode;
  className?: string;
}

function InfoPanel({ title, kicker, children, className = '' }: InfoPanelProps) {
  return (
    <section className={`info-panel ${className}`}>
      <div className="panel-heading">
        {kicker ? <span>{kicker}</span> : null}
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default InfoPanel;
