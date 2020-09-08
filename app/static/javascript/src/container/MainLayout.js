import React, { Component } from 'react';
import Header from '../components/Header';
import Homepage from './Homepage';

class MainLayout extends Component {
  render() {
    return (
      <div>
        <Header/>
        <div className = 'home-layout'>
          <Homepage/>
        </div>
      </div>
    );
  }
}

export default MainLayout;