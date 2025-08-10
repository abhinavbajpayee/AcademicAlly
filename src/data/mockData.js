const mockUsers = [
  { id: 'user1', name: 'Alice' },
  { id: 'user2', name: 'Bob' },
  { id: 'user3', name: 'Charlie' },
];

const mockCourses = [
  {
    id: 'course1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript.',
    instructor: 'Jane Doe',
    imageUrl: 'https://placehold.co/400x200/4F46E5/FFFFFF?text=Web+Dev',
    topics: ['HTML', 'CSS', 'JavaScript', 'React'],
  },
  {
    id: 'course2',
    title: 'Data Science with Python',
    description: 'Explore data analysis, machine learning, and visualization.',
    instructor: 'John Smith',
    imageUrl: 'https://placehold.co/400x200/F97316/FFFFFF?text=Data+Science',
    topics: ['Python', 'Pandas', 'NumPy', 'Scikit-learn'],
  },
  {
    id: 'course3',
    title: 'Digital Marketing Fundamentals',
    description: 'Master SEO, social media marketing, and content strategy.',
    instructor: 'Emily White',
    imageUrl: 'https://placehold.co/400x200/06B6D4/FFFFFF?text=Marketing',
    topics: ['SEO', 'Social Media', 'Content Strategy'],
  },
];

const mockStudyGroups = [
  {
    id: 'group1',
    title: 'React Study Group',
    courseId: 'course1',
    members: [mockUsers[0], mockUsers[1]],
    description: 'A group for collaborative learning and project building with React.',
    imageUrl: 'https://placehold.co/400x200/22C55E/FFFFFF?text=React+Group',
  },
  {
    id: 'group2',
    title: 'Python for Data Analysis',
    courseId: 'course2',
    members: [mockUsers[2]],
    description: 'Deep dive into data manipulation using Python libraries like Pandas.',
    imageUrl: 'https://placehold.co/400x200/3B82F6/FFFFFF?text=Python+Group',
  },
];

export const mockData = {
  courses: mockCourses,
  studyGroups: mockStudyGroups,
  users: mockUsers,
};

