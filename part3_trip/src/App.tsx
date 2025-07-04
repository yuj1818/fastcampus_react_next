import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TestPage from '@pages/Test';
import HotelListPage from '@pages/HotelList';
import HotelPage from '@pages/Hotel';
import useLoadKakao from '@hooks/useLoadKakao';
import SigninPage from './pages/Signin';
import MyPage from './pages/My';
import AuthGuard from '@components/auth/AuthGuard';
import Navbar from '@shared/Navbar';

function App() {
  useLoadKakao();

  return (
    <BrowserRouter>
      <AuthGuard>
        <Navbar />
        <Routes>
          <Route path="/" element={<HotelListPage />} />
          <Route path="/hotel/:id" element={<HotelPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/signin" element={<SigninPage />} />
          <Route path="/my" element={<MyPage />} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}

export default App;
