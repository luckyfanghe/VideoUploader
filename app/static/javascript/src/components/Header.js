import React from 'react';
import logo from '../assets/logo.png';

const Header = () => {
  return (
    <header>
      <img src={logo} className="logo"></img>
      <span className="logo-text">MOVIE SHARING AND STORAGE</span>
    </header>
  );
};

export default Header;