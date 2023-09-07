import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useContext } from "react";
import { ColorModeContext, useMode } from "../../theme";
import { CssBaseline, ThemeProvider } from "@mui/material";

const CreateCategoryWindow = ({ onClose, fetchCategories }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("");

  const handleCategoryNameChange = (event) => {
    setCategoryName(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle the form submission here (e.g., call an API to create the new category)
    console.log("New category name:", categoryName);
    axios
          .post("https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games", { categoryName: categoryName })
          .then((response) => {
            console.log(response.data); // Success message from the Lambda function
            onClose(); // Close the window after successful API request
            fetchCategories();
             navigate("/creategame");
          })
          .catch((error) => {
            console.error(error);
          });

    onClose(); // Close the window after form submission
  };

  return (
  <ColorModeContext.Provider value= {colorMode}>
    <ThemeProvider theme = {theme}>
    <CssBaseline />
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, background: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
        <h1>Creating new category</h1>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Category name"
            value={categoryName}
            onChange={handleCategoryNameChange}
            fullWidth
            required
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary">Create Category</Button>
        </form>
        <Button variant="contained" color="secondary" onClick={onClose}>Cancel</Button>
      </div>
    </div>
    </ThemeProvider>
   </ColorModeContext.Provider>
  );
};

export default CreateCategoryWindow;
