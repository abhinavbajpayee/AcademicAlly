import React, { useState } from "react";

const ExploreCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    platform: "",
    link: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.link) return alert("Title aur Link mandatory hai!");
    setCourses([...courses, formData]);
    setFormData({ title: "", description: "", platform: "", link: "" });
    setShowForm(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Explore Courses</h1>

      {/* Button to toggle form */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="bg-blue-600 text-white px-4 py-2 rounded-md mb-4"
      >
        {showForm ? "Cancel" : "Add Course"}
      </button>

      {/* Add Course Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-100 p-4 rounded-lg mb-6">
          <input
            type="text"
            name="title"
            placeholder="Course Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="text"
            name="platform"
            placeholder="Platform (Udemy, Coursera, YouTube...)"
            value={formData.platform}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            name="description"
            placeholder="Course Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />
          <input
            type="url"
            name="link"
            placeholder="Course Link"
            value={formData.link}
            onChange={handleChange}
            className="w-full p-2 border rounded mb-2"
          />

          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Save Course
          </button>
        </form>
      )}

      {/* Show Added Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.length === 0 ? (
          <p className="text-gray-500">Abhi tak koi course add nahi hua.</p>
        ) : (
          courses.map((course, idx) => (
            <div key={idx} className="p-4 border rounded-lg shadow-sm bg-white">
              <h2 className="text-lg font-semibold">{course.title}</h2>
              <p className="text-sm text-gray-600">{course.description}</p>
              <p className="text-sm text-blue-600">{course.platform}</p>
              <a
                href={course.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 underline"
              >
                Go to Course
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ExploreCoursesPage;
