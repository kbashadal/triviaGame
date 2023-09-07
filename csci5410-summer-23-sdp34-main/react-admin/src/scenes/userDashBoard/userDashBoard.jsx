import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  useTheme,
  Grid
} from "@mui/material";
import { ColorModeContext } from "../../theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Topbar } from "../global/Topbar";
import { useContext } from "react";
import { TextField, MenuItem, Button } from "@mui/material";
import { tokens } from "../../theme";
import axios from "axios";
import PlayCard from "../game/GameCard.jsx"
import './dash.css'


export const UserDashBoard = () =>
{
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const [allGames, setAllGames] = useState("");
    const[gamesData, setGamesData] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [difficultyLevels, setDifficultyLevels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const fetchDifficultyLevels = useCallback(async () => {
          try {
            const response = await axios.get(
              "https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/getGameCategory"
            );
            console.log(response.data.body)
            const categoriesWithCreateOption = ["All", ...response.data['body']];
            setDifficultyLevels(categoriesWithCreateOption); // Assuming the API returns an array of difficulty levels
            setDifficulty("All")
          } catch (error) {
            console.error("Error fetching difficulty levels:", error);
          }
        }, []);
      useEffect(() => {
          fetchDifficultyLevels();
        }, [fetchDifficultyLevels]);
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
            const categoriesWithCreateOption = ["All", ...extractedCategories];
            setCategories(categoriesWithCreateOption);
            setSelectedCategory("All")
          } catch (error) {
            console.error("Error fetching categories:", error);
          }
        }, []);
      useEffect(() => {
          fetchCategories();
        }, [fetchCategories]);
    const fetchGames = useCallback(async () => {
              try {
                const response = await axios.get(
                  "https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games/difficultylevel"
                );
                const gameNamesList = response.data.map((gameData) => gameData.gameName.S);
                setAllGames(gameNamesList);
               const gameDataDictionary = response.data.reduce((acc, gameData) => {
                 const gameName = gameData.gameName.S;
                 const { gameName: _, ...rest } = gameData;
                 acc[gameName] = rest;
                 return acc;
               }, {});
                setGamesData(gameDataDictionary)
              } catch (error) {
                console.error("Error fetching categories:", error);
              }
            }, []);
          useEffect(() => {
              fetchGames();
            }, [fetchGames]);


    const handleDifficultyFilter = (event) => {
      const selectedValue = event.target.value;
      setDifficulty(selectedValue);
    };
    console.log("setSelectedCategory");
    console.log(gamesData);
    return (
       <ColorModeContext.Provider value={colorMode}>
         <ThemeProvider theme={theme}>
           <CssBaseline />
           <Grid container spacing={2}>
             <Grid item xs={12}>
               <Topbar />
             </Grid>
             <div style={{ display: 'flex', justifyContent: 'center' }}>
               <div className="play-list" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                 <div style={{ marginBottom: '16px' }}>
                   <div style={{ marginRight: '16px' }}>
                     <label htmlFor="difficulty">Filter by Difficulty:</label>
                     <TextField
                       label="Difficulty Level"
                       select
                       value={difficulty}
                       onChange={handleDifficultyFilter}
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
                   </div>
                   <div>
                     <label htmlFor="category">Filter by Category:</label>
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
                   </div>
                 </div>

                 <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                   {Object.entries(gamesData)
                     .filter(([gameName, gameData]) => {
                       // If difficulty is set to "All" and no category is selected, show all games
                       if (difficulty === "All" && selectedCategory === "All") {
                         return true;
                       }
                       if (difficulty === "All") {
                         if (selectedCategory) {
                           return gameData.selectedCategory.S === selectedCategory;
                         }
                       }
                       if (selectedCategory === "All") {
                         if (difficulty) {
                           return gameData.difficulty.S === difficulty;
                         }
                       }
                       // Filter games based on selected difficulty and category
                       if (selectedCategory) {
                         return (
                           gameData.difficulty.S === difficulty &&
                           gameData.selectedCategory.S === selectedCategory
                         );
                       } else {
                         return gameData.difficulty.S === difficulty;
                       }
                     })
                     .map(([gameName, gameData]) => (
                       <PlayCard key={gameName} gameName={gameName} gameData={gameData} />
                     ))}
                 </div>
               </div>
             </div>
           </Grid>
         </ThemeProvider>
       </ColorModeContext.Provider>






              );
}
export default UserDashBoard;