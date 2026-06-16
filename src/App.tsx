import '@mantine/core/styles.css'
import { MantineProvider } from '@mantine/core'
import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { router } from '@core/router'
import { AppThemeProvider } from '@core/theme/AppThemeProvider'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <AppThemeProvider>
          <RouterProvider router={router} />
        </AppThemeProvider>
      </MantineProvider>
    </QueryClientProvider>
  )
}
