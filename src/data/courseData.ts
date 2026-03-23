// Centralized course and curriculum data structure

export interface Topic {
  id: string;
  title: string;
  duration: string;
  moduleId: string;
}

export interface Module {
  id: string;
  title: string;
  topicIds: string[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  instructor: string;
  moduleIds: string[];
}

// All available topics across all courses
export const TOPICS: Record<string, Topic> = {
  // Course 1: EDU 411 - Instructional Design
  '1': { id: '1', title: 'Introduction', duration: '15 min', moduleId: '1' },
  '2': { id: '2', title: 'Core Concepts', duration: '20 min', moduleId: '1' },
  '3': { id: '3', title: 'Practice', duration: '25 min', moduleId: '1' },
  '4': { id: '4', title: 'Deep Dive', duration: '30 min', moduleId: '2' },
  '5': { id: '5', title: 'Case Studies', duration: '25 min', moduleId: '2' },
  
  // Course 2: EDU 412 - Educational Technology
  '6': { id: '6', title: 'Tech Foundations', duration: '20 min', moduleId: '3' },
  '7': { id: '7', title: 'Digital Tools', duration: '25 min', moduleId: '3' },
  '8': { id: '8', title: 'Learning Platforms', duration: '30 min', moduleId: '4' },
  '9': { id: '9', title: 'Assessment Tech', duration: '20 min', moduleId: '4' },
  '10': { id: '10', title: 'Future Trends', duration: '25 min', moduleId: '4' },
  
  // Course 3: EDU 413 - Curriculum Development
  '11': { id: '11', title: 'Curriculum Basics', duration: '20 min', moduleId: '5' },
  '12': { id: '12', title: 'Learning Objectives', duration: '25 min', moduleId: '5' },
  '13': { id: '13', title: 'Content Design', duration: '30 min', moduleId: '6' },
  '14': { id: '14', title: 'Assessment Design', duration: '25 min', moduleId: '6' },
  
  // Course 4: EDU 414 - Learning Analytics
  '15': { id: '15', title: 'Data Fundamentals', duration: '20 min', moduleId: '7' },
  '16': { id: '16', title: 'Analytics Tools', duration: '25 min', moduleId: '7' },
  '17': { id: '17', title: 'Predictive Models', duration: '30 min', moduleId: '8' },
  '18': { id: '18', title: 'Ethical Considerations', duration: '20 min', moduleId: '8' },
};

// All modules across all courses
export const MODULES: Record<string, Module> = {
  // Course 1 modules
  '1': { id: '1', title: 'Module 1: Foundations', topicIds: ['1', '2', '3'] },
  '2': { id: '2', title: 'Module 2: Advanced Topics', topicIds: ['4', '5'] },
  
  // Course 2 modules
  '3': { id: '3', title: 'Module 1: Technology Basics', topicIds: ['6', '7'] },
  '4': { id: '4', title: 'Module 2: Advanced Technology', topicIds: ['8', '9', '10'] },
  
  // Course 3 modules
  '5': { id: '5', title: 'Module 1: Curriculum Foundations', topicIds: ['11', '12'] },
  '6': { id: '6', title: 'Module 2: Design Principles', topicIds: ['13', '14'] },
  
  // Course 4 modules
  '7': { id: '7', title: 'Module 1: Analytics Basics', topicIds: ['15', '16'] },
  '8': { id: '8', title: 'Module 2: Advanced Analytics', topicIds: ['17', '18'] },
};

// All available courses
export const COURSES: Record<string, Course> = {
  '1': {
    id: '1',
    code: 'EDU 411',
    title: 'Instructional Design',
    instructor: 'Dr. Smith',
    moduleIds: ['1', '2'],
  },
  '2': {
    id: '2',
    code: 'EDU 412',
    title: 'Educational Technology',
    instructor: 'Prof. Johnson',
    moduleIds: ['3', '4'],
  },
  '3': {
    id: '3',
    code: 'EDU 413',
    title: 'Curriculum Development',
    instructor: 'Dr. Williams',
    moduleIds: ['5', '6'],
  },
  '4': {
    id: '4',
    code: 'EDU 414',
    title: 'Learning Analytics',
    instructor: 'Prof. Davis',
    moduleIds: ['7', '8'],
  },
};

// Helper functions
export function getCourseModules(courseId: string): Module[] {
  const course = COURSES[courseId];
  if (!course) return [];
  return course.moduleIds.map(id => MODULES[id]).filter(Boolean);
}

export function getModuleTopics(moduleId: string): Topic[] {
  const module = MODULES[moduleId];
  if (!module) return [];
  return module.topicIds.map(id => TOPICS[id]).filter(Boolean);
}

export function getCourseTopics(courseId: string): Topic[] {
  const modules = getCourseModules(courseId);
  return modules.flatMap(module => getModuleTopics(module.id));
}

export function getAllCourseIds(): string[] {
  return Object.keys(COURSES);
}

export function getTopicsByCourse(courseId: string): string[] {
  return getCourseTopics(courseId).map(t => t.id);
}
