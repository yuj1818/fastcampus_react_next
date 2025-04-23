import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from '@pages/Home';
import TestPage from '@pages/Test';
import CardPage from '@pages/Card';
import ScrollToTop from '@shared/ScrollToTop';
import SigninPage from '@pages/Signin';
import SignupPage from '@pages/Signup';
import ApplyPage from '@pages/Apply';
import Navbar from '@shared/Navbar';
import PrivateRoute from '@components/auth/PrivateRoute';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" Component={HomePage} />
        <Route path="/card/:id" Component={CardPage} />
        <Route path="/signin" Component={SigninPage} />
        <Route path="/signup" Component={SignupPage} />
        <Route
          path="/apply/:id"
          element={
            <PrivateRoute>
              <ApplyPage />
            </PrivateRoute>
          }
        />
        <Route path="/test" Component={TestPage} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
