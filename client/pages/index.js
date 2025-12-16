import buildClient from "../api/build-client";

const LandingPage = ({ currentUser }) => {
  // console.log(currentUser);
  // axios.get('/api/users/currentuser').catch((err) => {
  //   console.log(err.message);
  // });
  console.log("inside LandingPage, currentUser:");
  console.log(currentUser);
  
  return currentUser ? (
    <h1>You are signed in.</h1>
  ) : (
    <h1>You are NOT signed in.</h1>
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

