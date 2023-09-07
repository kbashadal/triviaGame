import { tokens } from "../../theme";
import { useContext } from "react";
import { ColorModeContext, useMode } from "../../theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Topbar } from "../global/Topbar";
import {Sidebar } from "../global/Sidebar";
// import { Dashboard } from "../dashboard/index";
import { Calendar } from "../calendar/calendar";
import { Route, Routes } from 'react-router-dom';
import React, { useState } from 'react';
import {
  Typography,
  Box,
  useTheme,
  Grid
} from "@mui/material";



export const DashboardPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const [showEmbed, setShowEmbed] = useState(false);
  const handleEmbedButtonClick = () => {
      setShowEmbed(true);
    };
  return (
        <ColorModeContext.Provider value= {colorMode}>
          <ThemeProvider theme = {theme}>
            <CssBaseline />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Topbar />
              </Grid>
              <Grid item xs={12} md={2}>
                <Sidebar />
              </Grid>
            <Grid item xs={12} md={10}>
            <Box sx={{ maxWidth: 600, mx: "auto" }}>
            <Box sx={{ mt: 2 }}>
            <iframe width="600" height="450" src="https://lookerstudio.google.com/embed/reporting/fda75ae0-5372-4ef1-81ea-60997d56403d/page/9M3YD"></iframe>
            <iframe width="600" height="450" src="https://lookerstudio.google.com/embed/reporting/8953c180-9fca-455f-9318-1a8a4d4cc2a8/page/OY3YD"></iframe>
{/*                 {showEmbed ? ( */}
{/*                         <iframe */}
{/*                           src="https://lookerstudio.google.com/reporting/fda75ae0-5372-4ef1-81ea-60997d56403d" */}
{/*                           title="Looker Studio Embed" */}
{/*                           width="100%" */}
{/*                           height="500px" */}
{/*                         /> */}
{/*                       ) : ( */}
{/*                         <button onClick={handleEmbedButtonClick}>Games per Category</button> */}
{/*                       )} */}
{/*                 {showEmbed ? ( */}
{/*                                         <iframe */}
{/*                                           src="https://lookerstudio.google.com/s/i0731MaSPZQ" */}
{/*                                           title="Looker Studio Embed" */}
{/*                                           width="100%" */}
{/*                                           height="500px" */}
{/*                                         /> */}
{/*                                       ) : ( */}
{/*                                         <button onClick={handleEmbedButtonClick}>Questions per Category</button> */}
{/*                                       )} */}
                      </Box>
                      </Box>
             </Grid>
             </Grid>
          </ThemeProvider>
        </ColorModeContext.Provider>

      );
};

export default DashboardPage;
