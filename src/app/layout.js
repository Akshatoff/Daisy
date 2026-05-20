import './globals.css'
import Toast from '@/components/Toast'

export const metadata = {
  title: 'Daisy — Focus & Productivity',
  description: 'Tasks, focus sessions, notes, and clarity — all in one place.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toast />
      </body>
    </html>
  )
}
