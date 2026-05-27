import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export function LogOut() {

  async function handleClick() {
    await supabase.auth.signOut()
  }


  return (
    <Button onClick={handleClick}>Log out</Button>
  )
}