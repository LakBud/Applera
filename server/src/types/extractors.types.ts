export type CVData = {
  name: string;
  email: string;
  phone: string;
  github: string;
  summary: string;
  seniority_level: string;
  skills: string[];
  experience: {
    title: string;
    company: string;
    highlights: string[];
  }[];
  education: {
    title: string;
    school: string;
  }[];
};

export type JobData = {
  title: string;
  required_skills: string[];
  responsibilities: string[];
  seniority: string;
};
