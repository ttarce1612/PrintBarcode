/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import MTable from '../../../components/TableList';

const inboundService = require('../../../services/inboundService');
const dispatcher = require("../../../libs/dispatcher");

export default function Inbounds() {
  const [state, setState] = React.useState({
    columns: [
      { title: 'INB#', field: 'code' },
      { title: 'Item', field: 'item' },
      { title: 'Qty', field: 'qty' },
      { title: 'Unit', field: 'unit' },
      { title: 'Cost', field: 'cost' }
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
      title="Danh Sách Nhập Hàng"
      columns={state.columns}
      id="inbound_list"
      options={{
        search: true,
        actionsColumnIndex: -1,
        exportButton: false
        // rowStyle: rowData => ({
        //   // backgroundColor: 'red',
        //   cursor: 'pointer'
        // })
      }}
      data={inboundService.getList}
      actions={[
        {
          icon: 'edit',
          tooltip: 'Edit inbound',
          onClick: (event, rowData) => {
            dispatcher.dispatch('inbound_add_new', {
              action: "UPDATE",
              data: rowData
            });
          }
        }
      ]}
    />
  );
}
