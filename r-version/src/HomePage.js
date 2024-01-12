import React from 'react';
import { Link } from '@mui/material';

const HomePage = () => {
  return (
    <div>
      <h1>RMcGhee.GitHub.io</h1>
      <Link href="cs_projects.html">CS Projects</Link><br />
      <Link href="synbio.html">Synthetic Biology</Link><br />
      <Link href="photography.html">Photography</Link><br />
      <Link href="index.html">Home</Link><br />
      <Link href="https://github.com/RMcGhee">My GitHub</Link>
    </div>
  );
};

export default HomePage;
