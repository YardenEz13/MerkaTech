import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LockIcon, MailIcon, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export function LoginForm({ className }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError("נא למלא את כל השדות")
      setSuccess("")
      return
    }
    
    try {
      setIsLoading(true)
      setError("")
      setSuccess("")
      
      // Show success message briefly before redirecting
      await signInWithEmailAndPassword(auth, email, password)
      setSuccess("התחברת בהצלחה! מעביר אותך למערכת...")
      
      // Delay navigation slightly to show success message
      setTimeout(() => {
        navigate("/control")
      }, 1000)
    } catch (error) {
      console.error("Login error:", error)
      
      // More specific error messages
      if (error.code === 'auth/invalid-email') {
        setError("כתובת האימייל אינה תקינה")
      } else if (error.code === 'auth/user-not-found') {
        setError("משתמש לא קיים במערכת")
      } else if (error.code === 'auth/wrong-password') {
        setError("סיסמה שגויה")
      } else if (error.code === 'auth/too-many-requests') {
        setError("יותר מדי נסיונות התחברות, נסה שוב מאוחר יותר")
      } else {
        setError("שם משתמש או סיסמה שגויים")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
  <div className="space-y-6"> {/* Increased vertical spacing */}
    <div className="relative group">
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white group-focus-within:text-blue-400 transition-colors duration-200">
        <MailIcon className="h-4 w-4" />
      </div>
      <Input
        type="email"
        placeholder="דוא״ל"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="pr-10 py-2 h-12 bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 text-blue-200 placeholder:text-blue-200 transition-all duration-200"
        dir="rtl"
      />
    </div>

    <div className="relative group">
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-white group-focus-within:text-blue-400 transition-colors duration-200">
        <LockIcon className="h-4 w-4" />
      </div>
      <Input
        type="password"
        placeholder="סיסמה"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="pr-10 py-2 h-12 bg-slate-800/50 border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 transition-all text-blue-200 placeholder:text-blue-200  duration-200"
        dir="rtl"
      />
    </div>

    {error && (
      <Alert 
        variant="destructive" 
        className="py-2 px-3 border-red-400/20 dark:border-red-700/30"
        dismissible
        onDismiss={() => setError("")}
      >
        <AlertTitle className="text-xs font-medium">שגיאת התחברות</AlertTitle>
        <AlertDescription className="text-xs">{error}</AlertDescription>
      </Alert>
    )}

    {success && (
      <Alert 
        variant="success" 
        className="py-2 px-3 border-green-400/20 dark:border-green-700/30 content-center"
      >
        <AlertDescription className="text-xs rtl">{success}</AlertDescription>
      </Alert>
    )}

    <Button 
      type="submit" 
      className="w-full h-12 bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-blue-700/20"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
          מתחבר...
        </>
      ) : (
        "התחבר"
      )}
    </Button>
  </div>
</form>
)
} 