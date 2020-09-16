/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import MTable from '../../../components/TableList';

const outboundService = require('../../../services/outboundService');

export default function Onbounds() {
  const [state, setState] = React.useState({
    columns: [
      { title: 'Mã Xuất Hàng#', field: 'code' },
      { title: 'Mã Đơn Hàng#', field: 'socode' },
      { title: 'Sản phẩm', field: 'item' },
      { title: 'Số lượng', field: 'qty' },
      { title: 'Trạng thái', field: 'status'},
      { title: 'Đơn vị', field: 'unit' },
      { title: 'Giá tiền', field: 'cost' }
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
    <MTable
      title="Danh Sách Xuất Hàng"
      columns={state.columns}
      id="outbound_list"
      options={{
        search: true,
        actionsColumnIndex: -1,
        exportButton: false
        // rowStyle: rowData => ({
        //   // backgroundColor: 'red',
        //   cursor: 'pointer'
        // })
      }}
      data={outboundService.getList}
      actions={[
        {
          icon: 'assignment_return',
          tooltip: 'Hoàn tất gói hàng',
          onClick: (event, rowData) => {
            let _data = rowData;
            /**
             * Status
             * 0 ==> Mới
             * 1 ==> Đang Gói Hàng
             * 2 ==> Đã Gói Hàng
             * 3 ==> Đang Giao hàng
             * 4 ==> Hoàn tất
             */
            _data['status'] = "ĐÃ GÓI HÀNG";
            outboundService.update(_data);
            // dispatcher.dispatch('outbound_add_new', {
            //   action: "UPDATE",
            //   data: rowData
            // });
          }
        }
      ]}
    />
  );
}
