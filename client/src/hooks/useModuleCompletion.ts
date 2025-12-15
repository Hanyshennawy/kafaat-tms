import { useState, useEffect } from 'react';

// Module completion status - in a real app this would come from the backend
export interface ModuleStatus {
  id: string;
  name: string;
  completion: number; // 0-100
  setupSteps: {
    name: string;
    completed: boolean;
  }[];
}

const MODULE_COMPLETION_KEY = 'kafaat-module-completion';

// Default module status for demo purposes
const defaultModuleStatus: ModuleStatus[] = [
  {
    id: 'career',
    name: 'Career Progression',
    completion: 75,
    setupSteps: [
      { name: 'Define career paths', completed: true },
      { name: 'Setup skills matrix', completed: true },
      { name: 'Map employees to paths', completed: true },
      { name: 'Enable recommendations', completed: false },
    ]
  },
  {
    id: 'succession',
    name: 'Succession Planning',
    completion: 50,
    setupSteps: [
      { name: 'Identify key positions', completed: true },
      { name: 'Create talent pools', completed: true },
      { name: 'Define readiness criteria', completed: false },
      { name: 'Setup assessments', completed: false },
    ]
  },
  {
    id: 'performance',
    name: 'Performance Management',
    completion: 100,
    setupSteps: [
      { name: 'Configure review cycles', completed: true },
      { name: 'Setup goal templates', completed: true },
      { name: 'Enable 360 feedback', completed: true },
      { name: 'Define rating scales', completed: true },
    ]
  },
  {
    id: 'workforce',
    name: 'Workforce Planning',
    completion: 25,
    setupSteps: [
      { name: 'Define workforce model', completed: true },
      { name: 'Setup scenarios', completed: false },
      { name: 'Configure alerts', completed: false },
      { name: 'Enable forecasting', completed: false },
    ]
  },
  {
    id: 'placement',
    name: 'Staff Placement',
    completion: 60,
    setupSteps: [
      { name: 'Setup locations', completed: true },
      { name: 'Configure transfer rules', completed: true },
      { name: 'Enable approvals', completed: true },
      { name: 'Setup matching', completed: false },
      { name: 'Configure analytics', completed: false },
    ]
  },
  {
    id: 'recruitment',
    name: 'Recruitment',
    completion: 80,
    setupSteps: [
      { name: 'Setup job templates', completed: true },
      { name: 'Configure pipelines', completed: true },
      { name: 'Enable AI screening', completed: true },
      { name: 'Setup interview scheduling', completed: true },
      { name: 'Configure offers', completed: false },
    ]
  },
  {
    id: 'engagement',
    name: 'Employee Engagement',
    completion: 90,
    setupSteps: [
      { name: 'Create survey templates', completed: true },
      { name: 'Setup pulse surveys', completed: true },
      { name: 'Configure analytics', completed: true },
      { name: 'Enable AI insights', completed: true },
      { name: 'Setup actions', completed: false },
    ]
  },
  {
    id: 'competency',
    name: 'Competency Assessments',
    completion: 40,
    setupSteps: [
      { name: 'Define frameworks', completed: true },
      { name: 'Setup standards', completed: true },
      { name: 'Configure assessments', completed: false },
      { name: 'Enable evidence', completed: false },
      { name: 'Setup development plans', completed: false },
    ]
  },
  {
    id: 'psychometric',
    name: 'Psychometric Assessments',
    completion: 30,
    setupSteps: [
      { name: 'Select assessment types', completed: true },
      { name: 'Configure scoring', completed: false },
      { name: 'Setup reports', completed: false },
      { name: 'Enable analytics', completed: false },
    ]
  },
  {
    id: 'licensing',
    name: 'Teacher Licensing',
    completion: 95,
    setupSteps: [
      { name: 'Configure license types', completed: true },
      { name: 'Setup requirements', completed: true },
      { name: 'Enable blockchain verification', completed: true },
      { name: 'Configure CPD tracking', completed: true },
      { name: 'Setup renewals', completed: false },
    ]
  },
];

export function useModuleCompletion() {
  const [modules, setModules] = useState<ModuleStatus[]>(() => {
    try {
      const saved = localStorage.getItem(MODULE_COMPLETION_KEY);
      return saved ? JSON.parse(saved) : defaultModuleStatus;
    } catch {
      return defaultModuleStatus;
    }
  });

  useEffect(() => {
    localStorage.setItem(MODULE_COMPLETION_KEY, JSON.stringify(modules));
  }, [modules]);

  const getModuleStatus = (moduleId: string) => {
    return modules.find(m => m.id === moduleId);
  };

  const updateModuleStep = (moduleId: string, stepName: string, completed: boolean) => {
    setModules(prev => prev.map(m => {
      if (m.id !== moduleId) return m;
      const updatedSteps = m.setupSteps.map(s => 
        s.name === stepName ? { ...s, completed } : s
      );
      const completion = Math.round(
        (updatedSteps.filter(s => s.completed).length / updatedSteps.length) * 100
      );
      return { ...m, setupSteps: updatedSteps, completion };
    }));
  };

  const overallCompletion = Math.round(
    modules.reduce((acc, m) => acc + m.completion, 0) / modules.length
  );

  return { modules, getModuleStatus, updateModuleStep, overallCompletion };
}
