import React from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import Typography from "@mui/material/Typography";
import classes from "./index.module.css";

const ChartComponent = ({ data }) => {
  // Get the top 3 entries
  const topEntries = data.slice(0, 3);

  // Prepare the data for the chart
  const chartData = topEntries.map((entry) => ({
    name: entry.name,
    score: entry.score,
    right_answers: entry.right_answers,
    wrong_answers: entry.wrong_answers,
  }));

  // Define custom colors for the pie chart
  const colors = ["#8884d8", "#82ca9d", "#ffc658"];

  return (
    <div className={classes.chartContainer}>
      {data.length > 0 ? (
        <>
          <PieChart width={600} height={400}>
            <Pie
              data={chartData}
              dataKey="score"
              outerRadius={120}
              fill="#8884d8"
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
          <Typography variant="h6" align="center" className={classes.chartTitle}>
            Top 3 {topEntries[0].entity_type === "team" ? "Teams" : "Players"}
          </Typography>
        </>
      ) : (
        <Typography variant="h6" align="center" className={classes.noDataText}>
          No Data Found
        </Typography>
      )}
    </div>
  );
};

export default ChartComponent;
