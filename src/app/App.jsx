// File: src/app/App.jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import routeConfig from './routes';
import { loadCurrentUser } from '../features/auth/slice/authSlice';
import { getAccessToken } from '../services/storage/localStorage';

const router = createBrowserRouter(routeConfig);
export default function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (getAccessToken()) dispatch(loadCurrentUser());
  }, [dispatch]);

  return <RouterProvider router={router} />;
}
