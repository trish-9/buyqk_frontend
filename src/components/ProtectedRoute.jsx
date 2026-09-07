import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

export default function ProtectedRoute() {
  const location = useLocation()

  const isLoggedIn =
    localStorage.getItem('isLoggedIn') === 'true'

  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    )
  }

  return <Outlet />
}