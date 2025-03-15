import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { LockIcon, MailIcon, ShieldIcon } from "lucide-react"

export function LoginForm({ className, backgroundImage }: { className?: string, backgroundImage?: string }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate("/control")
    } catch (error) {
      setError("Invalid email or password")
      console.error("Login error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className={cn(
        "min-h-screen flex items-center justify-center p-4 bg-cover bg-center", 
        className
      )}
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      <div className="w-full max-w-md relative z-10">
        <Card className="border-0 shadow-lg backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
              <ShieldIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-blue-100">Welcome Back</CardTitle>
            <CardDescription className="text-md text-blue-200 dark:text-gray-400">
              Login to your secure command system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-blue-200">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <MailIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium ">
                    Password
                  </Label>
                 
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <LockIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white dark:bg-gray-800"
                    required
                  />
                </div>
              </div>
              {error && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 text-red-600 rounded-md flex items-start">
                  <span className="mr-2">⚠️</span>
                  <span>{error}</span>
                </div>
              )}
              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-2.5 rounded-md transition-all duration-200 shadow-md hover:shadow-lg"
                  disabled={loading}
                >
                  {loading ? "Authenticating..." : "Sign In"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t px-6 py-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Secure login • All activity is monitored and logged
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Semi-transparent overlay for background image */}
      {backgroundImage && (
        <div className="fixed inset-0 bg-black/40 z-0" />
      )}
    </div>
  )
}