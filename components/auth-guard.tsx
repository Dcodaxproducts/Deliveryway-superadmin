'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

const publicRoutes = new Set(['/auth/login'])

const getStoredToken = () => {
  return localStorage.getItem('token') || localStorage.getItem('accessToken')
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getStoredToken()
    const isPublicRoute = publicRoutes.has(pathname)

    if (isPublicRoute) {
      if (token) {
        router.replace('/')
        return
      }

      setLoading(false)
      return
    }

    if (!token) {
      router.replace('/auth/login')
      setLoading(false)
      return
    }

    setLoading(false)
  }, [pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-200 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return <>{children}</>
}
