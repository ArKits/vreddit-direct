import React from 'react';
import {
    MuiThemeProvider,
    createMuiTheme
  } from "@material-ui/core/styles";
import Typography from '@material-ui/core/Typography';
import './Header.css';

const theme = createMuiTheme({
    typography: {
      fontFamily: [
        'IBM Plex Mono'
      ].join(',')
    },
  });

function Header() {
  return (
    <div className="Header">
    <MuiThemeProvider theme={theme}>
        <center>
        <Typography variant="h3">v.redd.it-direct</Typography>
        </center>
    </MuiThemeProvider>
    </div>
  );
}

export default Header;
