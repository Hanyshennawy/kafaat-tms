import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "wouter";

interface BreadcrumbItem {
  label: string;
  path: string;
}

// Map paths to breadcrumb items
const pathMap: Record<string, { label: string; parent?: string }> = {
  '/dashboard': { label: 'Dashboard' },
  
  // Career Progression
  '/career/paths': { label: 'Career Paths', parent: 'Career Progression' },
  '/career/skills': { label: 'Skills Matrix', parent: 'Career Progression' },
  '/career/employee-skills': { label: 'My Skills', parent: 'Career Progression' },
  '/career/recommendations': { label: 'Recommendations', parent: 'Career Progression' },
  
  // Succession Planning
  '/succession/plans': { label: 'Succession Plans', parent: 'Succession Planning' },
  '/succession/talent-pools': { label: 'Talent Pools', parent: 'Succession Planning' },
  '/succession/assessments': { label: 'Leadership Assessments', parent: 'Succession Planning' },
  
  // Performance Management
  '/performance/dashboard': { label: 'Dashboard', parent: 'Performance' },
  '/performance/cycles': { label: 'Cycles', parent: 'Performance' },
  '/performance/goals': { label: 'Goals', parent: 'Performance' },
  '/performance/self-appraisal': { label: 'Self Appraisal', parent: 'Performance' },
  '/performance/manager-review': { label: 'Manager Review', parent: 'Performance' },
  '/performance/360-feedback': { label: '360° Feedback', parent: 'Performance' },
  
  // Workforce Planning
  '/workforce/scenarios': { label: 'Scenarios', parent: 'Workforce Planning' },
  '/workforce/allocations': { label: 'Resource Allocation', parent: 'Workforce Planning' },
  '/workforce/alerts': { label: 'Alerts', parent: 'Workforce Planning' },
  
  // Staff Placement
  '/placement': { label: 'Dashboard', parent: 'Staff Placement' },
  '/placement/requests': { label: 'Placement Requests', parent: 'Staff Placement' },
  '/placement/history': { label: 'Transfer History', parent: 'Staff Placement' },
  '/placement/directory': { label: 'Staff Directory', parent: 'Staff Placement' },
  '/placement/analytics': { label: 'Analytics', parent: 'Staff Placement' },
  
  // Recruitment
  '/recruitment/dashboard': { label: 'Dashboard', parent: 'Recruitment' },
  '/recruitment/requisitions': { label: 'Job Requisitions', parent: 'Recruitment' },
  '/recruitment/candidates': { label: 'Candidates', parent: 'Recruitment' },
  '/recruitment/interviews': { label: 'Interviews', parent: 'Recruitment' },
  
  // Engagement
  '/engagement/dashboard': { label: 'Dashboard', parent: 'Engagement' },
  '/engagement/surveys': { label: 'Surveys', parent: 'Engagement' },
  '/engagement/activities': { label: 'Activities', parent: 'Engagement' },
  
  // Competency
  '/competency/my-competencies': { label: 'My Competencies', parent: 'Competency' },
  '/competency/frameworks': { label: 'Frameworks', parent: 'Competency' },
  '/competency/standards': { label: 'Standards', parent: 'Competency' },
  '/competency/assessments': { label: 'Assessments', parent: 'Competency' },
  '/competency/evidence': { label: 'Evidence', parent: 'Competency' },
  '/competency/development-plans': { label: 'Development Plans', parent: 'Competency' },
  
  // Psychometric
  '/psychometric': { label: 'Dashboard', parent: 'Psychometric' },
  '/psychometric/take-assessment': { label: 'Take Assessment', parent: 'Psychometric' },
  '/psychometric/results': { label: 'My Results', parent: 'Psychometric' },
  '/psychometric/personality': { label: 'Personality Profile', parent: 'Psychometric' },
  '/psychometric/cognitive': { label: 'Cognitive Ability', parent: 'Psychometric' },
  '/psychometric/analytics': { label: 'Analytics', parent: 'Psychometric' },
  
  // Licensing
  '/licensing/portal': { label: 'Portal', parent: 'Teacher Licensing' },
  '/licensing/apply': { label: 'Apply for License', parent: 'Teacher Licensing' },
  '/licensing/my-applications': { label: 'My Applications', parent: 'Teacher Licensing' },
  '/licensing/licenses': { label: 'Licenses Management', parent: 'Teacher Licensing' },
  '/licensing/cpd': { label: 'CPD Records', parent: 'Teacher Licensing' },
  '/licensing/verify': { label: 'Verify License', parent: 'Teacher Licensing' },
  
  // Admin
  '/admin/questions': { label: 'Questions Management', parent: 'Question Bank' },
  '/admin/qms-analytics': { label: 'Analytics', parent: 'Question Bank' },
  
  // Other
  '/reports': { label: 'Reports & Analytics' },
  '/settings': { label: 'Settings' },
  '/top-performers': { label: 'Top Performers' },
  '/performance-trends': { label: 'Performance Trends' },
  '/notifications': { label: 'Notifications' },
  '/profile': { label: 'Profile' },
};

export function Breadcrumb() {
  const [location] = useLocation();
  
  const pathInfo = pathMap[location];
  if (!pathInfo || location === '/dashboard') {
    return null;
  }

  const items: BreadcrumbItem[] = [
    { label: 'Home', path: '/dashboard' }
  ];

  if (pathInfo.parent) {
    items.push({ label: pathInfo.parent, path: location });
  }
  items.push({ label: pathInfo.label, path: location });

  return (
    <nav className="flex items-center text-sm text-muted-foreground mb-4">
      {items.map((item, index) => (
        <div key={item.path + index} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
          {index === 0 ? (
            <Link href={item.path} className="flex items-center hover:text-foreground transition-colors">
              <Home className="h-4 w-4" />
            </Link>
          ) : index === items.length - 1 ? (
            <span className="text-foreground font-medium">{item.label}</span>
          ) : (
            <span className="text-muted-foreground">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
