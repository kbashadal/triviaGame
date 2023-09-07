import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import { useContext } from "react";
import { ColorModeContext, useMode } from "../../theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Button, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import { v4 as uuidv4 } from "uuid";


const InviteTeamWindow = ({ onClose, fetchCategories }) => {
  console.log("fetchCategories"+fetchCategories)
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("");
  const [checkedRows, setCheckedRows] = useState({});
  const [userId, setUserId] = useState("");
  const [teamId, setTeamId] = useState("");
  const handleCategoryNameChange = (event) => {
    setCategoryName(event.target.value);
  };
  const handleCheckboxChange = (event, category) => {
      setCheckedRows((prevState) => ({
        ...prevState,
        [category]: event.target.checked,
      }));
    };
  useEffect(() => {

      try {

        setTeamId(sessionStorage.getItem("team_id"));

      } catch (error) {

        console.error(

          "Error occurred while retrieving 'team_id' from session storage:",

          error

        );

        sessionStorage.removeItem("user_id");

        navigate("/");

      }

    }, [navigate]);
  useEffect(() => {

      try {

        setUserId(sessionStorage.getItem("user_id"));

      } catch (error) {

        console.error(

          "Error occurred while retrieving 'user_id' from session storage:",

          error

        );

        sessionStorage.removeItem("team_id");

        navigate("/");

      }

    }, [userId]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const checkedCategories = Object.keys(checkedRows).filter((category) => checkedRows[category]);

    for (const emailId of checkedCategories) {
        axios
                  .get(`https://3x8jbspfnl.execute-api.us-east-1.amazonaws.com/user-id?email=${emailId}`)
                  .then((response) => {
//                     console.log(response.data); // Success message from the Lambda function
//                     console.log("session userId:"+userId)
//                     console.log("session teamId: "+teamId)
                    const SenderId = userId;
                    const RecieverId = response.data['userid'];
                    const uuid = uuidv4();
                    axios.post("https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games/invite", {
                                                                                                                                  SenderId,
                                                                                                                                  RecieverId,
                                                                                                                                  uuid
                                                                                                                                })
                        .then((response) => {
                        console.log(response.data);
                          })
                          .catch((error) => {
                            console.error(error);
                          });


                  })
                  .catch((error) => {
                    console.error(error);
                  });

//           try {
//             const response =  axios.get(`https://3x8jbspfnl.execute-api.us-east-1.amazonaws.com/user-id?email=${emailId}`);
//             console.log(response.Promise.result.data);
// //             console.log(parseInt(response.data['userid']));
// //             console.log("UserId::"+response.data['userid'])
//           } catch (error) {
//             console.error(`Error fetching user data for emailId: ${emailId}:`, error.message);
//           }
        }
    onClose(); // Close the window after form submission
  };

  return (
  <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
              background: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", textAlign: "center" }}>
              <h1>Creating new category</h1>
              <form onSubmit={handleSubmit}>
              {/* Table to display categories */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Email </TableCell>
                      <TableCell>Select</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {fetchCategories.map((category, index) => (
                      <TableRow key={index}>
                        <TableCell>{category}</TableCell>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={checkedRows[category] || false}
                            onChange={(event) => handleCheckboxChange(event, category)}
                          />

                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button type="submit" variant="contained" color="primary">
                 Send Invite
                </Button>
              <Button variant="contained" color="secondary" onClick={onClose}>
                  Cancel
                </Button>
              </form>
            </div>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
  );
};

export default InviteTeamWindow;
