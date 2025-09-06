// src/components/dev/DevSeeder.jsx
import { useEffect } from "react";

const sampleCourses = [
  { id: "c1", title: "Intro to Machine Learning", platform: "Coursera", teacherName: "Dr. Singh", tags: ["ml","python"], careerPathways: ["Data Scientist","ML Engineer"] },
  { id: "c2", title: "React for Beginners", platform: "Udemy", teacherName: "A. Sharma", tags: ["react","frontend"], careerPathways: ["Frontend Engineer","Full-stack"] },
  { id: "c3", title: "DSA Mastery", platform: "NPTEL", teacherName: "Prof. Kumar", tags: ["ds","algorithms"], careerPathways: ["Software Engineer","Competitive Programmer"] }
];

const sampleInternships = [
  { id: "i1", title: "Frontend Intern", org: "Acme Tech", desc: "Work on React UI", applyLink: "", postedBy: "Acme", applicants: [], type: "internship" },
  { id: "i2", title: "ML Intern", org: "DataLabs", desc: "Model research", applyLink: "", postedBy: "DataLabs", applicants: [], type: "internship" }
];

const sampleMentors = [
  { id: "m1", title: "ML Office Hours", topic: "ML basics", mentorIds: ["mentor_1"], bookings: [] }
];

export default function DevSeeder() {
  useEffect(() => {
    if (!localStorage.getItem("courses_v1")) {
      localStorage.setItem("courses_v1", JSON.stringify(sampleCourses));
      console.log("DevSeeder: courses_v1 seeded");
    }
    if (!localStorage.getItem("internships_v1")) {
      localStorage.setItem("internships_v1", JSON.stringify(sampleInternships));
      console.log("DevSeeder: internships_v1 seeded");
    }
    if (!localStorage.getItem("mentorshipRooms_v1")) {
      localStorage.setItem("mentorshipRooms_v1", JSON.stringify(sampleMentors));
      console.log("DevSeeder: mentorshipRooms_v1 seeded");
    }
  }, []);
  return null;
}
