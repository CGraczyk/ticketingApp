import { useEffect, useState } from "react";
import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
  const [isHttp, setIsHttp] = useState(false);

  useEffect(() => {
    setIsHttp(window.location.protocol === "http:");
  }, []);

  // console.log(currentUser);
  // axios.get('/api/users/currentuser').catch((err) => {
  //   console.log(err.message);
  // });
  console.log("inside LandingPage, currentUser:");
  console.log(currentUser);
  
  return currentUser ? (
    <h1>You are signed in.</h1>
  ) : (
    <div>
      <h1>You are NOT signed in.</h1>
      {isHttp && !currentUser ? (
        <div className="alert alert-warning">
          Warning: You are on HTTP. Secure session cookies will not work without HTTPS.
        </div>
      ) : null}
    </div>
  );
};

LandingPage.getInitialProps = async (context) => {
  
  console.log("Landing Page.")
  console.log(`inside LandingPage.getInitialProps: ${context}`);
  const client = buildClient(context);
  const { data } = await client.get("/api/users/currentuser")
  
  return data;
};
  
export default LandingPage;
