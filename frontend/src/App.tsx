// src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { DashboardPage } from './features/auth/DashboardPage';
import { ResourcesPage } from './features/resources/ResourcesPage';
import { ResourceCreatePage } from './features/resources/ResourceCreatePage';
import { ResourceEditPage } from './features/resources/ResourceEditPage';
import { BookingCreatePage } from './features/bookings/BookingCreatePage';
import { MyBookingsPage } from './features/bookings/MyBookingsPage';
import { BookingEditPage } from './features/bookings/BookingEditPage';
import { AllBookingsPage } from './features/bookings/AllBookingsPage';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { BookingCalendarPage } from './features/bookings/BookingCalendarPage';
function App() {
  return (
    <Routes>
      {/* Публичные маршруты (без Layout) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Защищённые маршруты (с Layout) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Resources */}
      <Route
        path="/resources"
        element={
          <ProtectedRoute>
            <Layout>
              <ResourcesPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resources/create"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <ResourceCreatePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/resources/edit/:id"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <ResourceEditPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Bookings */}
      <Route
        path="/bookings/create"
        element={
          <ProtectedRoute>
            <Layout>
              <BookingCreatePage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings/my"
        element={
          <ProtectedRoute>
            <Layout>
              <MyBookingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings/edit/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <BookingEditPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/bookings/all"
        element={
          <ProtectedRoute requireAdmin>
            <Layout>
              <AllBookingsPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Редирект с главной */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />

      <Route
  path="/bookings/calendar"
  element={
    <ProtectedRoute>
      <Layout>
        <BookingCalendarPage />
      </Layout>
    </ProtectedRoute>
  }
/>
    </Routes>


  );
}

export default App;