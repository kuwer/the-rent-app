import { useEffect } from "react";
import { IGetUserOutput } from "./interfaces/outputs";
import { IUser } from "./interfaces/models";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./state/store";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { Navbar } from "./common/navbar/navbar";
import Register from "./screens/register";
import { actions } from "./state/user/userSlice";
import { isLoggedInApi } from "./svc/auth";
import AllProducts from "./screens/allProduct";
import Login from "./screens/login";
import Shop from "./screens/shop";

const ProtectedRoute = (props: {
  isAuthenticated: boolean;
  redirectTo: string;
}) => {
  const { isAuthenticated, redirectTo } = props;
  return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} />;
};

function App() {
  const currentUser = useSelector((state: RootState) => state.currentUser);
  const dispatch = useDispatch();

  const isLoggedIn = async (): Promise<void> => {
    const setCurrentUser = actions.setCurrentUser;
    try {
      const response: IGetUserOutput = await isLoggedInApi();
      if (response.isSuccess) {
        const currentUser = response.result;
        dispatch(setCurrentUser(currentUser));
      } else {
        const currentUser = {} as IUser;
        dispatch(setCurrentUser(currentUser));
      }
    } catch (error) {
      const currentUser = {} as IUser;
      dispatch(setCurrentUser(currentUser));
      console.error(error);
    }
  };

  useEffect(() => {
    isLoggedIn();
    // eslint-disable-next-line
  }, []);

  if (currentUser === null) {
    return <h1>Loading...</h1>;
  }
  
  const isAuthenticated: boolean = currentUser.id !== undefined;
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<AllProducts />} />
        <Route
          element={
            <ProtectedRoute
              isAuthenticated={isAuthenticated}
              redirectTo="/login"
            />
          }
        >
          <Route path="/shop" element={<Shop />} />
        </Route>
        <Route
          element={
            <ProtectedRoute isAuthenticated={!isAuthenticated} redirectTo="/" />
          }
        >
          <Route path="/login" element={<Login />} />
        </Route>
        <Route
          element={
            <ProtectedRoute isAuthenticated={!isAuthenticated} redirectTo="/" />
          }
        >
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
