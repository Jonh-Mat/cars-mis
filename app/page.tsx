import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // Redirect to dashboard if already logged in
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-primary opacity-90" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4">
          <div className="flex min-h-[calc(100vh-4rem)] items-center">
            <div className="grid lg:grid-cols-2 gap-12 w-full items-center">
              {/* Left Column - Content */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
                    Welcome to Car Rental System
                  </h1>
                  <p className="text-xl text-blue-100">
                    Experience hassle-free car rentals with our state-of-the-art
                    booking system.
                  </p>
                </div>

                {/* Auth Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/signin"
                    className={cn(
                      'flex items-center justify-center gap-2',
                      'px-6 py-3 rounded-xl',
                      'bg-white dark:bg-navy-800',
                      'text-blue-600 dark:text-blue-400',
                      'font-semibold text-lg',
                      'transition duration-200',
                      'hover:bg-gray-50 dark:hover:bg-navy-700',
                      'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
                    )}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className={cn(
                      'flex items-center justify-center gap-2',
                      'px-6 py-3 rounded-xl',
                      'bg-transparent',
                      'text-white',
                      'font-semibold text-lg',
                      'border-2 border-white',
                      'transition duration-200',
                      'hover:bg-white/10',
                      'focus:outline-none focus:ring-2 focus:ring-white'
                    )}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                    Create Account
                  </Link>
                </div>

                {/* Features */}
                <div className="grid sm:grid-cols-2 gap-4 pt-8">
                  {[
                    {
                      icon: (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      ),
                      title: 'Quick Booking',
                      description: 'Book your car in minutes',
                    },
                    {
                      icon: (
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ),
                      title: '24/7 Support',
                      description: 'Always here to help you',
                    },
                  ].map((feature) => (
                    <div
                      key={feature.title}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm"
                    >
                      <div className="text-white">{feature.icon}</div>
                      <div>
                        <h3 className="font-semibold text-white">
                          {feature.title}
                        </h3>
                        <p className="text-blue-100 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column - Image */}
              <div className="hidden lg:block">
                <div className="relative h-[600px]">
                  <Image
                    src="/cars/heroo.png"
                    alt="Featured Car"
                    fill
                    style={{ objectFit: 'contain' }}
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="animate-bounce-soft drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
