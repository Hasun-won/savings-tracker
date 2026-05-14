import React from 'react';
import { Account } from '../types';
import * as utils from '../utils';

interface PlanCardProps {
  plan: Account;
  currentMonthIndex: number;
  actions?: React.ReactNode;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, currentMonthIndex, actions }) => {
  const balance = utils.getAccountBalance(plan, currentMonthIndex);
  const progress = utils.getAccountProgress(plan, currentMonthIndex);
  const end = utils.planEndDate(plan);

  return (
    <article className="plan-card">
      <div className="plan-card-header">
        <span className="plan-badge" style={{ backgroundColor: plan.dotColor }} />
        <div>
          <h3>{plan.name}</h3>
          <p className="plan-subtitle">{plan.amount}/{plan.freq} · {plan.durationValue} {plan.durationUnit}{plan.durationValue !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="plan-card-body">
        <div className="plan-value">{utils.formatMoney(balance)}</div>
        <div className="plan-target">Target {utils.formatMoney(plan.total)}</div>
        <div className="progress-bar">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: plan.dotColor }} />
          </div>
          <span>{Math.round(progress * 100)}% complete</span>
        </div>
        <div className="plan-duration">{new Date(plan.startDate).toLocaleDateString()} → {end.toLocaleDateString()}</div>
      </div>
      {actions ? <div className="plan-card-actions">{actions}</div> : null}
    </article>
  );
};

export default PlanCard;
