const END_POINT = "http://localhost:3000";
import axios from "axios";

const getData = async (endPoint, auth) => {
  const newHeaders = {
    authorization: localStorage.getItem("USER_TOKEN") || "",
  };

  const res = auth
    ? await axios.get(`${END_POINT}${endPoint}`, {
        headers: {
          ...newHeaders,
        },
      })
    : await axios.get(`${END_POINT}${endPoint}`);

  return res.data;
};

const postData = async (endPoint, payload, auth, headers = {}) => {
  const newHeaders = auth
    ? {
        headers: {
          ...headers,
          authorization: localStorage.getItem("USER_TOKEN"),
        },
      }
    : { headers: headers };

  const res = await axios.post(`${END_POINT}${endPoint}`, payload, newHeaders);

  return res.data;
};

export { getData, postData };
