import { createRoot } from 'react-dom/client';
import './index.css';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout.tsx';
import { ChatPage } from './pages/chat-page.tsx';
import { NewChatPage } from './pages/new-chat-page.tsx';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<NewChatPage />} />
                <Route path="chat/:id" element={<ChatPage />} />
            </Route>
        </Routes>
    </BrowserRouter>,
);
