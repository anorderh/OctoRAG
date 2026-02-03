import { createRoot } from 'react-dom/client';
import './styles/breadcrumb.css';
import './styles/button.css';
import './styles/card.css';
import './styles/colors.css';
import './styles/root.css';
import './styles/text-animation.css';

// Bootstrap.
import 'bootstrap/dist/css/bootstrap.min.css';

// Setup Fontawesome icons.
import { library } from '@fortawesome/fontawesome-svg-core';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { Root } from './components/Root';
library.add(fas, far, fab);

createRoot(document.getElementById('root')!).render(<Root />);
