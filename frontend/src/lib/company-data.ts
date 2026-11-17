export type Company = {
  name: string;
  role: string;
  requiredSkills: string[];
};

export const companies: Company[] = [
  {
    name: 'Google',
    role: 'Data Engineer',
    requiredSkills: ['Python', 'TensorFlow', 'SQL', 'GCP', 'Machine Learning'],
  },
  {
    name: 'Amazon',
    role: 'Software Engineer',
    requiredSkills: ['Java', 'AWS', 'Spring Boot', 'DynamoDB', 'Microservices'],
  },
  {
    name: 'Microsoft',
    role: 'Frontend Developer',
    requiredSkills: ['TypeScript', 'React', 'Azure', '.NET', 'GraphQL'],
  },
  {
    name: 'Netflix',
    role: 'Backend Engineer',
    requiredSkills: ['Java', 'Python', 'AWS', 'Kafka', 'Docker'],
  },
  {
    name: 'Meta',
    role: 'AI Researcher',
    requiredSkills: ['PyTorch', 'Python', 'C++', 'Computer Vision', 'NLP'],
  },
  {
    name: 'Apple',
    role: 'iOS Developer',
    requiredSkills: ['Swift', 'Objective-C', 'Xcode', 'JavaScript'],
  },
  {
    name: 'Salesforce',
    role: 'DevOps Engineer',
    requiredSkills: ['DevOps', 'Kubernetes', 'Docker', 'AWS', 'Python'],
  },
  {
    name: 'Adobe',
    role: 'Cloud Engineer',
    requiredSkills: ['Cloud Computing', 'AWS', 'Azure', 'GCP', 'Terraform'],
  },
];
