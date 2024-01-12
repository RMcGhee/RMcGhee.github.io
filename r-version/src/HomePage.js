import React from 'react';
import { Grid, Link, Paper, Container } from '@mui/material';

const HomePage = () => {
  return (
    <Container>
      <Paper style={{ padding: 20, marginTop: 30 }}>
        <Grid container direction="column" alignItems="center" justify="center">
          <Grid item>
            <h1>RMcGhee.GitHub.io</h1>
          </Grid>
          <Grid item>
            <Link href="cs_projects.html">CS Projects</Link>
          </Grid>
          <Grid item>
            <Link href="synbio.html">Synthetic Biology</Link><br />
          </Grid>
          <Grid item>
            <Link href="photography.html">Photography</Link><br />
          </Grid>
          <Grid item>
            <Link href="index.html">Home</Link><br />
          </Grid>
          <Grid item>
           <Link href="https://github.com/RMcGhee">My GitHub</Link>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default HomePage;
