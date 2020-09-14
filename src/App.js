/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */

import React from 'react';

import Toast from './components/Toast';
import CommingSoon from './components/CommingSoon';
import Route from './routes';

const App = function App() {
  return (
    <div className="App">
        <Route />
        <Toast />
        <CommingSoon />
    </div>
  );
}

export default App;
