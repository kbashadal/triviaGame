// import React, { useState } from "react";
// import { useTable, usePagination } from "react-table";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Typography,
//   Button,
//   IconButton,
//   TextField,
//   Select,
//   MenuItem,
//   InputAdornment,
// } from "@mui/material";
// import { FirstPage, LastPage, NavigateBefore, NavigateNext, Search } from "@mui/icons-material";
// import styles from "./index.module.css"; // Use a different CSS module

// const TableComponent = ({ columns, data }) => {
//   const [pageSize, setPageSize] = useState(5);
//   const [searchText, setSearchText] = useState("");

//   const {
//     getTableProps,
//     getTableBodyProps,
//     headerGroups,
//     prepareRow,
//     page,
//     nextPage,
//     previousPage,
//     canNextPage,
//     canPreviousPage,
//     pageOptions,
//     state: { pageIndex },
//   } = useTable(
//     {
//       columns,
//       data,
//       initialState: { pageIndex: 0, pageSize },
//     },
//     usePagination
//   );

//   const handlePageSizeChange = (event) => {
//     setPageSize(parseInt(event.target.value, 10));
//   };

//   const handleSearchChange = (event) => {
//     setSearchText(event.target.value);
//   };

//   const filteredData = data.filter((row) =>
//     Object.values(row).some((value) =>
//       value ? value.toString().toLowerCase().includes(searchText.toLowerCase()) : false
//     )
//   );

//   return (
//     <div>
//       <div className={styles.tableToolbar}>
//         <TextField
//           label="Search"
//           value={searchText}
//           onChange={handleSearchChange}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Search />
//               </InputAdornment>
//             ),
//           }}
//         />
//         <Select value={pageSize} onChange={handlePageSizeChange}>
//           <MenuItem value={5}>5 rows</MenuItem>
//           <MenuItem value={10}>10 rows</MenuItem>
//           <MenuItem value={20}>20 rows</MenuItem>
//         </Select>
//       </div>
//       <TableContainer className={styles.tableContainer}>
//         <Table className={styles.table} {...getTableProps()}>
//           <TableHead>
//             {headerGroups.map((headerGroup, index) => (
//               <TableRow
//                 key={index}
//                 {...headerGroup.getHeaderGroupProps()}
//                 className={styles.customHeaderRow} // Use a different class for table header row
//               >
//                 {headerGroup.headers.map((column, i) => (
//                   <TableCell
//                     key={i}
//                     {...column.getHeaderProps()}
//                     className={styles.tableHeaderCell}
//                   >
//                     {column.render("Header")}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             ))}
//           </TableHead>
//           {page.length > 0 ? (
//             <TableBody {...getTableBodyProps()}>
//               {page.map((row, index) => {
//                 prepareRow(row);
//                 return (
//                   <TableRow
//                     key={index}
//                     {...row.getRowProps()}
//                     className={styles.customBodyRow} // Use a different class for table body row
//                   >
//                     {row.cells.map((cell, i) => (
//                       <TableCell key={i} {...cell.getCellProps()} className={styles.tableBodyCell}>
//                         {cell.render("Cell")}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           ) : (
//             <TableBody>
//               <TableRow>
//                 <TableCell colSpan={columns.length}>
//                   <Typography variant="body1" align="center">
//                     No Data Found
//                   </Typography>
//                 </TableCell>
//               </TableRow>
//             </TableBody>
//           )}
//         </Table>
//       </TableContainer>
//       {filteredData.length > pageSize && (
//         <div className={styles.pagination}>
//           <IconButton onClick={() => previousPage()} disabled={!canPreviousPage}>
//             <NavigateBefore />
//           </IconButton>
//           <Typography variant="body1" component="span">
//             Page{" "}
//             <strong>
//               {pageIndex + 1} of {pageOptions.length}
//             </strong>
//           </Typography>
//           <IconButton onClick={() => nextPage()} disabled={!canNextPage}>
//             <NavigateNext />
//           </IconButton>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TableComponent;


import React, { useState } from "react";
import { useTable, usePagination } from "react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
} from "@mui/material";
import { FirstPage, LastPage, NavigateBefore, NavigateNext } from "@mui/icons-material";
import styles from "./index.module.css"; // Use a different CSS module

const TableComponent = ({ columns, data }) => {
  const [pageSize, setPageSize] = useState(5); // Update pageSize based on the selected option
  const [searchText, setSearchText] = useState("");

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    state: { pageIndex },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize },
    },
    usePagination
  );

  const handlePageSizeChange = (event) => {
    setPageSize(parseInt(event.target.value, 10));
  };

  // ... Rest of the code remains the same

  return (
    <div>
      <TableContainer className={styles.tableContainer}>
        <Table className={styles.table} {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup, index) => (
              <TableRow
                key={index}
                {...headerGroup.getHeaderGroupProps()}
                className={styles.customHeaderRow}
              >
                {headerGroup.headers.map((column, i) => (
                  <TableCell
                    key={i}
                    {...column.getHeaderProps()}
                    className={styles.tableHeaderCell}
                    style={{color: 'rgb(12, 12, 12)'}}
                  >
                    {column.render("Header")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          {page.length > 0 ? (
            <TableBody {...getTableBodyProps()}>
              {page.map((row, index) => {
                prepareRow(row);
                return (
                  <TableRow
                    key={index}
                    {...row.getRowProps()}
                    className={styles.customBodyRow}
                  >
                    {row.cells.map((cell, i) => (
                      <TableCell key={i} {...cell.getCellProps()} className={styles.tableBodyCell} style={{color: 'rgb(12, 12, 12)'}}>
                        {cell.render("Cell")}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Typography variant="body1" align="center">
                    No Data Found
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
      {page.length > 0 && (
        <div className={styles.pagination}>
          <IconButton onClick={() => previousPage()} disabled={!canPreviousPage}>
            <NavigateBefore />
          </IconButton>
          <Typography variant="body1" component="span">
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>
          </Typography>
          <IconButton onClick={() => nextPage()} disabled={!canNextPage}>
            <NavigateNext />
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default TableComponent;
