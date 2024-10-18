import { Navigate, useRoutes } from 'react-router-dom'
import { AppLayout } from '@/components/layouts/app-layout'
import Error404 from '@/pages/404'
import Home from '@/pages/home'
import SessionView from '@/pages/session/session-view'
import LibraryView from '@/pages/library/library-view'
import { Container } from './container'

export const AppRoutes = () => {
  return useRoutes([
    { 
      element: <Container/>,
      children: [
        { 
          element: <AppLayout />,
          children: [
            { path: '/', element: <Home/>},
            { path: '/libraries/:libraryId', element: <LibraryView/> },
            { path: '/libraries/:libraryId/session/:sessionId', element: <SessionView/> }
          ]
        },
        { path: '*', element: <Error404 /> }
      ]
    },
  ])
}

