import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/")
      }
    })

    return () => unsubscribe()
  }, [navigate])

  return <>{children}</>
} 