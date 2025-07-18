import { Component } from "solid-js";
import { useAuthPB } from "../config/pocketbase";
import { getAge } from "../methods/getAge";

const Home: Component = () => {
  const { user } = useAuthPB();

  return (
    <div>
      <div>
        <h2>Home</h2>
        <div>
          <h4>Logged in as {user.name}</h4>
          <h5>Stats</h5>
          <p>Email: {user.email}</p>
          <p>Height: {user.height}</p>
          <p>Height: {user.height}</p>
          <p>Age: {user.dob ? getAge(user.dob) : "N/A"}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
