import { LoginForm } from "../components/login-form"

export default function Login() {
  return (
    <div className="relative min-h-screen w-full">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-screen object-cover z-0"
        src="/photos-videos/tankVideo.mp4"
      >
      </video>

      {/* Login Form Container */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-lg">
          <LoginForm className=" "/>
        </div>
      </div>
    </div>
  )
}