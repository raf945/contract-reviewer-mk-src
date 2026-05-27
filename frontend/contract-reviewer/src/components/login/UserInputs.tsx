import type { SubmitEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface userDetailTypes {
  usernameValue: string;
  passwordValue: string;
  onUsernameChange: (val: string) => void
  onPasswordChange: (val: string) => void
  onSubmit: () => void
};

export default function UserInputs( userDetails : userDetailTypes) {


  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    userDetails.onSubmit();
  }


  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>

      <CardContent>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">

          <Label>Username
            <Input 
            placeholder='Enter username'
            value={ userDetails.usernameValue }
            onChange={ (e) => userDetails.onUsernameChange(e.target.value) } 
            />
          </Label>

        </div>

        <div className="space-y-2">
          <Label>Password
            <Input 
            type='password'
            placeholder='Enter Password'
            value={ userDetails.passwordValue }
            onChange={ (e) => userDetails.onPasswordChange(e.target.value) }
            
            />
          </Label>
        </div>

        <Button type='submit' className='w-full'>
          Login
        </Button>
        </form>
      </CardContent>
    </Card>
  )
}