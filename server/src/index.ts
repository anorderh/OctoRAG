import 'reflect-metadata';
import { App } from './core/App.js';
import './integrations/dependencies.js';

let app: App = new App();
app.start();
