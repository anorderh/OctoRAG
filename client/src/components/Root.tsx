import {
    createBrowserRouter,
    RouterProvider,
    type UIMatch,
} from 'react-router';
import { AuthenticatedGuard } from '../guards/Authenticated.guard';
import { useChat } from '../hooks/useChat';
import App from './App';
import { ChatPage } from './chat/ChatPage';
import { Home, type RepoChat } from './home/Home';
import { Login } from './login/Login';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: 'login',
                element: <Login />,
                handle: (m: UIMatch) => ({
                    icon: 'fa-solid fa-user',
                    display: 'Login',
                }),
            },
            {
                element: <AuthenticatedGuard />,
                children: [
                    {
                        handle: (m: UIMatch) => ({
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
                                path: 'chat/:chatId',
                                element: <ChatPage />,
                                loader: async ({ params }) => {
                                    const chat = await useChat(params.chatId!);
                                    return { chat };
                                },
                                handle: (m: UIMatch) => {
                                    const { chat } = m.loaderData as {
                                        chat: RepoChat;
                                    };
                                    return {
                                        icon: 'fa-solid fa-message',
                                        display: `Chat with "${chat.repoName}"`,
                                    };
                                },
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
