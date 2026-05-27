import { BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import { ThemeProvider } from "@/components/theme-provider"
import Dashboard from '@/features/dashboard'
import LoginPage from '@/features/LoginPage'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'
import './App.css'

function App() {

  const [ session, setSession ] = useState<Session | null>(null)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])
  

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={ session ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/dashboard" element={ session ? <Dashboard/> : <Navigate to='/'/>} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
