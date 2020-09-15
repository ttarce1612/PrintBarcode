import React, { useState } from 'react';
import PropTypes from 'prop-types';
import LoginSession from './BarcodeModule/LoginSession';
import SearchSku from './BarcodeModule/SearchSku'
import ListBarcode from './BarcodeModule/ListBarcodeSku'
import './PrintBarcode.css'

Barcode.propTypes = {

};

function Barcode(props) {
  const [dataList, setDataList] = useState([])
  const doFindSku = (event) => {
    let sku = document.getElementById('search-by-sku').value
    console.log("doFindSku -> sku", sku)
  }
  const screenHeight = window.innerHeight - 18
  return (
    <div style={{minHeight: screenHeight}}>
      <div className="user-session">
        <LoginSession />
      </div>
      <div className="title">
        <h1 style={{ textAlign: "left", paddingLeft: "35px" }}>BARCODE PRINTING</h1>
      </div>
      <div className="sku-list">
        <ListBarcode />
      </div>
    </div>
  );
}

export default Barcode;