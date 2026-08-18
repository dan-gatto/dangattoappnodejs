import React from 'react';
import '../App.css';

const headerCss = {
  margin: '1em 1em 1em 1em',
  backgroundColor: 'coral',
};

const AppHeader = () => {
  return (
    <div className='row' style={headerCss}>
      <div>
        <h1 className='appHeader'>Daniel Gatto Web App</h1>
      </div>
    </div>
  );
};
export default AppHeader;
