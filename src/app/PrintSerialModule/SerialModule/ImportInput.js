import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import GetAppIcon from '@material-ui/icons/GetApp';
import React from 'react';
import excel from '../../../assets/SerialPrintList.xlsx';
const useStyles = makeStyles((theme) => ({
  root: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  input: {
    display: 'none',
  },
}));


export default function UploadButtons(props) {
  const classes = useStyles();
  function changeHandler(event) {
    props.handleChange(event)
  }
  function handleDownload() {
    console.log("File downloaded")
  }
  return (
    <div className={classes.paper}>
      <Typography component="h1" variant="h5" style={{ paddingBottom: "20px" }}>
        Import from Excel
        </Typography>
      <span style={{ paddingRight: "50px" }}>
        <Button
          variant="contained"
          color="default"
          component="label"
          className={classes.button}
          startIcon={<CloudUploadIcon />}
        >
          Upload Excel File
        <input
            type="file"
            id="uploadInputFile"
            style={{ display: "none" }}
            onChange={changeHandler.bind(this)}
            accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          />
        </Button>
      </span>
      <span>
      <a href={excel} style={{textUnderlineOffset:"none"}}>
        <Button
          variant="contained"
          color="default"
          className={classes.button}
          startIcon={<GetAppIcon />}
          onClick = {handleDownload}
        >
          Download Template
        </Button>
        </a>
      </span>
    </div>
  );
}
