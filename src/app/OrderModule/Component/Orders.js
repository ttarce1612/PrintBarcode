/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import MTable from '../../../components/TableList';

const orderService = require('../../../services/orderService');
const dispatcher = require("../../../libs/dispatcher");

export default function Orders() {
  const [state, setState] = React.useState({
    columns: [
      { title: 'Mã đơn hàng#', field: 'socode', 
        render: (rowData) => <span>{rowData.socode}</span>,
      },
      { title: 'Số điện thoại', field: 'phone' },
      { title: 'Sản phẩm', field: 'item' },
      { title: 'Đơn vị', field: 'unit' },
      { title: 'Số lượng', field: 'qty' },
      { title: 'Trạng thái', field: 'status' },
      { title: 'Địa chỉ', field: 'address' },
      { title: 'Giá tiền', field: 'cost' },
    ]
  });

  const [refresh, setRefresh] = React.useState("");

  React.useEffect(() => {
    if (refresh == "") {
      setRefresh(new Date());
    }
  });

  // React.useEffect(() => console.log('mounted'), []);

  React.useEffect(() => {
    return () => {
      console.log('unmounted')
    };
  }, []);

  return (
    <div style={{    marginTop: "70px",
      marginRight: "35px",
      width: "95%"
      }}>
<MTable
      title="Danh Sách Đặt Hàng"
      columns={state.columns}
      id="order_list"
      options={{
        search: true,
        actionsColumnIndex: -1,
        exportButton: false
        // rowStyle: rowData => ({
        //   // backgroundColor: 'red',
        //   cursor: 'pointer'
        // })
      }}
      data={orderService.getList}
      actions={[
        {
          icon: 'add_shopping_cart',
          tooltip: 'Tiến hành gói hàng',
          onClick: (event, rowData) => {
            let _data = rowData;
            /**
             * Status
             * 0 ==> MỚI
             * 1 ==> ĐANG GÓI HÀNG
             * 2 ==> ĐÃ GÓI HÀNG
             * 3 ==> ĐANG GIAO HÀNG
             * 4 ==> HOÀN TẤT
             */
            _data['status'] = "ĐANG GÓI HÀNG";
            orderService.update(_data);
          }
        }
      ]}
      detailPanel={rowData => {
        return (
          <div>
            <span>{rowData.socode}</span> ---
            <span>{rowData.phone}</span> ---
            <span>{rowData.item}</span> ---
            <span>{rowData.unit}</span> ---
            <span>{rowData.qty}</span> ---
            <span>{rowData.address}</span> ---
            <span>{rowData.cost}</span>
          </div>
        )
      }}
    />
    </div>
  );
}
