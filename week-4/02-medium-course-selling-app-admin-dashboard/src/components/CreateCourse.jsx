import React, { useState } from "react";
import { postData } from "../utils/httpUtils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
/// You need to add input boxes to take input for users to create a course.
/// I've added one input so you understand the api to do it.
function CreateCourse() {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [imageLink, setImageLink] = useState("");
  const [published, setPublished] = useState(true);

  const navigate = useNavigate();

  const onSubmit = async () => {
    const res = await postData(
      "/admin/courses",
      {
        title,
        description,
        price: Number(price),
        imageLink,
        published: Boolean(published),
      },
      true
    );
    toast.success("New course created");
  };

  return (
    <div>
      <h1>Create Course Page</h1>
      <button onClick={() => navigate("/courses")}>View all courses</button>
      <p>Title</p>
      <input type={"text"} onChange={(e) => setTitle(e.target.value)} />
      <p>Description</p>

      <input type={"text"} onChange={(e) => setDescription(e.target.value)} />
      <p>Price</p>

      <input type={"number"} onChange={(e) => setPrice(e.target.value)} />
      <p>Image Link</p>

      <input type={"text"} onChange={(e) => setImageLink(e.target.value)} />
      <p>Published</p>

      <input type={"radio"} onChange={(e) => setPublished(e.target.value)} />
      <br></br>
      <button onClick={onSubmit}>Create Course</button>
    </div>
  );
}
export default CreateCourse;
