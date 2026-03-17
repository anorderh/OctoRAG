import { createRoot } from 'react-dom/client';
import './index.css';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Layout />}></Route>
        </Routes>
    </BrowserRouter>,
);
