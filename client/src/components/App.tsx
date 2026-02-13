import { Outlet } from 'react-router';
import { useAuthBootstrap } from '../hooks/useAuthBootstrap';
import { Layout } from './shared/Layout';

function App() {
    useAuthBootstrap();
    return (
        <div className="w-100 h-100 d-flex flex-column justify-content-start align-items-center">
            <Layout>
                <Outlet></Outlet>
            </Layout>
        </div>
    );
}

export default App;
