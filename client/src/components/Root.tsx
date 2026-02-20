import { createBrowserRouter, RouterProvider } from 'react-router';
import { AuthGuard } from '../guards/AuthGuard';
import App from './App';
import { ChatPage } from './chat/ChatPage';
import { Home } from './home/Home';
import { Login } from './login/Login';

export type RouteHandle = 'home' | 'chat' | 'login';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: 'login',
                element: <Login />,
                handle: 'login',
            },
            {
                element: <AuthGuard />,
                children: [
                    {
                        handle: 'home',
                        children: [
                            {
                                index: true,
                                element: <Home />,
                            },
                            {
                                path: 'chat/:chatId',
                                element: <ChatPage />,
                                handle: 'chat',
                            },
                        ],
                    },
                ],
            },
        ],
    },
]);

export function Root() {
    return <RouterProvider router={router}></RouterProvider>;
}
