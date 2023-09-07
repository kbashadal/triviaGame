import { ColorModeContext } from "../../theme";
import { Topbar } from "../global/Topbar";
import { Sidebar } from "../global/Sidebar";
import { useContext } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { TextField, MenuItem, Button } from "@mui/material";

import {
  Typography,
  Box,
  useTheme,
  Grid
} from "@mui/material";



export const AddDeleteCategoryQuestions = () => {
    const theme = useTheme();
    const [difficultyLevels, setDifficultyLevels] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [difficulty, setDifficulty] = useState("");
    const handleDeleteDifficultyFormSubmit = (event) =>{
        event.preventDefault();
        console.log('Deleting')
        console.log("difficulty"+difficulty)
        axios
                      .post("https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games/difficultylevel/deletedifficulty ", { name: difficulty,tableName:"gamesDifficultyLevel",key:"levelName" })
                      .then((response) => {
                        console.log(response.data); // Success message from the Lambda function
                        fetchDifficultyLevels();
                        console.log("difficultyLevels :"+difficultyLevels)

                      })
                      .catch((error) => {
                        console.error(error);
                      });


    }
    const handleDeleteCategoryFormSubmit = (event) =>{
        event.preventDefault();
        event.preventDefault();
                console.log('Deleting')
                console.log("difficulty"+difficulty)
                axios
                              .post("https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games/difficultylevel/deletedifficulty ", { name: selectedCategory,tableName:"GamesCategory",key:"name" })
                              .then((response) => {
                                console.log(response.data); // Success message from the Lambda function
                                fetchCategories();
                                console.log("difficultyLevels :"+categories)

                              })
                              .catch((error) => {
                                console.error(error);
                              });


        }
    const handleCreateDifficultySubmit = (event) =>{
        event.preventDefault();
                // Handle the form submission here (e.g., call an API to create the new category)
        axios
              .post("https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games/difficultylevel ", { levelName: difficulty })
              .then((response) => {
                console.log(response.data); // Success message from the Lambda function
                fetchDifficultyLevels();

              })
              .catch((error) => {
                console.error(error);
              });
    }
    const handleCategoryChange = (event) => {
          const selectedValue = event.target.value;
          setSelectedCategory(selectedValue);
        };
    const fetchCategories = useCallback(async () => {
          try {
            const response = await axios.get(
              "https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games"
            );
            const extractedCategories = response.data['body'].map(item => item);
            setCategories(extractedCategories);
          } catch (error) {
            console.error("Error fetching categories:", error);
          }
        }, []);
      useEffect(() => {
          fetchCategories();
        }, [fetchCategories]);

    const fetchDifficultyLevels = useCallback(async () => {
              try {
                const response = await axios.get(
                  "https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/getGameCategory"
                );
                setDifficultyLevels(response.data['body']); // Assuming the API returns an array of difficulty levels
              } catch (error) {
                console.error("Error fetching difficulty levels:", error);
              }
            }, []);
        useEffect(() => {
              fetchDifficultyLevels();
            }, [fetchDifficultyLevels]);

    const colorMode = useContext(ColorModeContext);
    const [categoryName, setCategoryName] = useState("");
    const handleCreateCategorySubmit = (event) => {
        event.preventDefault();
        // Handle the form submission here (e.g., call an API to create the new category)
        axios
              .post("https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games", { categoryName: categoryName })
              .then((response) => {
                console.log(response.data); // Success message from the Lambda function
                fetchCategories();
              })
              .catch((error) => {
                console.error(error);
              }); // Close the window after form submission
      };
    const handleCategoryNameChange = (event) => {
        setCategoryName(event.target.value);
      };
    return (
            <ColorModeContext.Provider value={colorMode}>
             <ThemeProvider theme={theme}>
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
                     <Typography variant="h5">Delete</Typography>
                     <Box sx={{ mt: 2 }}>
                         <form onSubmit={handleDeleteDifficultyFormSubmit}>
                             <TextField
                                   label="Difficulty Level"
                                   select
                                   value={difficulty}
                                   onChange={(e) => setDifficulty(e.target.value)}
                                   fullWidth
                                   required
                                   margin="normal"
                                 >
                                   {difficultyLevels.map((level) => (
                                     <MenuItem key={level} value={level}>
                                       {level}
                                     </MenuItem>
                                   ))}
                             </TextField>
                             <Button type="submit" variant="contained" color="primary">
                                Delete Difficulty Level
                           </Button>
                         </form>
                         <form onSubmit={handleDeleteCategoryFormSubmit}>
                              <TextField
                                label="Category"
                                select
                                value={selectedCategory || ""}
                                onChange={handleCategoryChange}
                                fullWidth
                                required
                                margin="normal"
                              >
                              {categories.map((category, index) => (
                                        <MenuItem key={category} value={category}>
                                          {category}
                                        </MenuItem>
                                      ))}
                              </TextField>
                              <Button type="submit" variant="contained" color="primary">
                                 Delete Category
                            </Button>
                          </form>
                          <br></br>
                          <Typography variant="h5">Create</Typography>
                           <form onSubmit={handleCreateCategorySubmit}>
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
                           <form onSubmit={handleCreateDifficultySubmit}>
                            <TextField
                              label="Difficulty Level"
                              value={difficulty}
                              onChange={(e) => setDifficulty(e.target.value)}
                              fullWidth
                              required
                              margin="normal"
                            />
                            <Button type="submit" variant="contained" color="primary">Create Difficulty</Button>
                          </form>
                     </Box>
                      </Box>
                 </Grid>
             </Grid>

             </ThemeProvider>
             </ColorModeContext.Provider>
    );
};
export default AddDeleteCategoryQuestions;
