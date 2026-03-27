import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Documents from './pages/Documents'
import Shares from './pages/Shares'
import SharedView from './pages/SharedView'
import Login from './pages/Login'
import Register from './pages/Register'
import InstallBanner from './components/InstallBanner'

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/shared/:token" element={<SharedView />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
          <Route path="documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
          <Route path="shares" element={<PrivateRoute><Shares /></PrivateRoute>} />
        </Route>
      </Routes>
      <InstallBanner />
    </>
  )
}

export default App
