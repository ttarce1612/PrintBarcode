import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsIcon from '@material-ui/icons/Directions';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

export default function SearchSku(props) {
  const classes = useStyles();
  const findSku = (event) => {
    props.handleFindSku(event)
  }

  return (
    <Paper component="form" className={classes.root}>
      {/* <IconButton className={classes.iconButton} aria-label="menu">
        <MenuIcon />
      </IconButton> */}
      <InputBase
        className={classes.input}
        id="search-by-sku"
        placeholder="Search by SKU"
        inputProps={{ 'aria-label': 'search by sku' }}
      />
      <IconButton onClick={findSku} className={classes.iconButton} aria-label="search-sku">
        <SearchIcon/>
      </IconButton>
      {/* <Divider className={classes.divider} orientation="vertical" /> */}
      {/* <IconButton color="primary" className={classes.iconButton} aria-label="directions">
        <DirectionsIcon />
      </IconButton> */}
    </Paper>
  );
}
