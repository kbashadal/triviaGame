import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useContext } from "react";
import { ColorModeContext, useMode } from "../../theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Topbar } from "../global/Topbar";
import {Sidebar } from "../global/Sidebar";
// import { Dashboard } from "../dashboard/index";
import { DashboardPage } from "../dashboard/DashboardPage";
import { Calendar } from "../calendar/calendar";
import { Route, Routes } from 'react-router-dom';
export const Admin = ({ }) =>
{
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    return (
      <ColorModeContext.Provider value= {colorMode}>
        <ThemeProvider theme = {theme}>
          <CssBaseline />
          <div className="app"></div>
          <Topbar />
          <main className= "content">
          <Sidebar />
          </main>
        </ThemeProvider>
      </ColorModeContext.Provider>

    );
}
export default Admin;
