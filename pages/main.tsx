import React from 'react';
import {createRoot} from 'react-dom/client';
import Home from '../app/page';
import DesignSystem from '../app/design-system/page';
import '../app/globals.css';
createRoot(document.getElementById('root')!).render(location.pathname.includes('/design-system')?<DesignSystem/>:<Home/>);
