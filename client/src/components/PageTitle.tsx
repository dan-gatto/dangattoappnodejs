import React from 'react';
import '../App.css';

interface PageTitleProps {
  pageTitle: string;
}

const PageTitle = ({ pageTitle }: PageTitleProps) => {
  return (
    <div>
      <div className='row'>
        <br></br>
      </div>
      <h2 className='row'>{pageTitle}</h2>
      <div className='row'>
        <br></br>
      </div>
      <div className='row'>
        <br></br>
      </div>
      <div className='row'>
        <br></br>
      </div>
      <div className='row'>
        <br></br>
      </div>
    </div>
  );
};
export default PageTitle;
