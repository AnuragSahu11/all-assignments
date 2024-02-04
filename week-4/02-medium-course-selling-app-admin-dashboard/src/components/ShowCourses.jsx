import React, { useEffect } from "react";
import { getData } from "../utils/httpUtils";
import { useNavigate } from "react-router-dom";

function ShowCourses() {
  const [courses, setCourses] = React.useState([]);
  let navigate = useNavigate();

  const getCourses = async () => {
    const res = await getData(`/admin/courses`, true);
    setCourses(res);
  };

  useEffect(() => {
    getCourses();
  }, []);

  // Add code to fetch courses from the server
  // and set it in the courses state variable.
  return (
    <div>
      <h1>Create Course Page</h1>
      <button onClick={() => navigate("/create")}>Create a Course</button>
      {courses.map((c) => (
        <Course key={c._id} title={c.title} />
      ))}
    </div>
  );
}

function Course(props) {
  return (
    <div>
      <h1>{props?.title}</h1>
    </div>
  );
}

export default ShowCourses;
