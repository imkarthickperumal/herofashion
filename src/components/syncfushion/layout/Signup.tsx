import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs'
import { ButtonComponent } from '@syncfusion/ej2-react-buttons'

interface User {
  id: number
  username: string
  password: string
  screen_per: string
}

export default function Signin1() {

  const [users, setUsers] = useState<User[]>([])
  const [username, setUsername] = useState<string>("")
  const [password, setPassword] = useState<string>("")

  const navigate = useNavigate()

  useEffect(() => {
    fetch("https://app.herofashion.com/incentive/api/incdeb_users/")
      .then(res => res.json())
      .then((data: User[]) => {
        setUsers(data)
      })
  }, [])

  const handleLogin = () => {

    const matchUser = users.find(
      user => user.username === username && user.password === password
    )

    if (matchUser) {

      navigate("/dashboard", {
        state: {
          username: matchUser.username,
          role: matchUser.screen_per
        }
      })

    } else {
      alert("Invalid Username or Password")
    }
  }

  return (
    <div className="p-10">

      <TextBoxComponent
        placeholder="Username"
        change={(e:any)=>setUsername(e.value)}
      />

      <TextBoxComponent
        type="password"
        placeholder="Password"
        change={(e:any)=>setPassword(e.value)}
      />

      <ButtonComponent
        content="Login"
        onClick={handleLogin}
      />

    </div>
  )
}