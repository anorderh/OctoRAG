import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router';
import App from './components/App.tsx';
import './styles/button.css';
import './styles/colors.css';
import './styles/text-animation.css';

// Bootstrap.
import 'bootstrap/dist/css/bootstrap.min.css';

// Setup Fontawesome icons.
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Home } from './components/home/Home.tsx';
library.add(fas, far, fab);

createRoot(document.getElementById('root')!).render(
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />}>
                <Route index element={<Home />} />
            </Route>
        </Routes>
    </BrowserRouter>,
);
