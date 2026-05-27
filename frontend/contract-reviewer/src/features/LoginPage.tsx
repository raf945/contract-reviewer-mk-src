import UserInputs from "../components/login/UserInputs"
import { useState } from'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

const LoginPage = () => {

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('');
  const navigate = useNavigate()

  async function handleLogin() {

    // Define data as 
    const { error } = await supabase.auth.signInWithPassword(

        // Change to actual login details when needed
        {
        email: username, // hugo@email.com
        password: password, // hugo
      })

      if (error) {
        alert('Incorrect details')
      }
      // Navigate to dashboard if successful
      else {
        navigate('/dashboard')
      }
  }


  return (
    <div className='min-h-screen flex items-center justify-center'>
      <UserInputs 
        usernameValue = { username } 
        passwordValue = { password }
        onUsernameChange = { setUsername }
        onPasswordChange = { setPassword }
        onSubmit= { handleLogin }
      />
    </div>
  )
}

export default LoginPage