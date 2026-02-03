import { createBrowserRouter, RouterProvider, type Params } from 'react-router';
import App from './App';
import { ChatPage } from './chat/ChatPage';
import { Home } from './home/Home';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                handle: () => ({
                    icon: 'fa-solid fa-house',
                    display: 'Home',
                    to: '/',
                }),
                children: [
                    {
                        index: true,
                        element: <Home />,
                    },
                    {
                        path: 'chat/:id',
                        element: <ChatPage />,
                        handle: (params: Params<'id'>) => ({
                            icon: 'fa-solid fa-message',
                            display: `Chat ${params.id}`,
                            to: `/chat/${params.id}`,
                        }),
                    },
                ],
            },
        ],
    },
]);

export interface Breadcrumb {
    icon?: string;
    display: string;
    to?: string;
}

export function Root() {
    return <RouterProvider router={router}></RouterProvider>;
}
