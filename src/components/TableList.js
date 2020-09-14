/**
 * Copyright (c) 2019 OVTeam
 * Modified date: 2019/11/11
 * Modified by: Duy Huynh
 */
import React from 'react';
import MaterialTable from 'material-table';
const dispatcher = require("./../libs/dispatcher");

export default class BasicExport extends React.Component {
    constructor(props) {
      super(props);
      this.tableRef = React.createRef();

      this.configs = {...props};
      this.configs.tableRef = this.tableRef;
      if(!this.configs.options) {
        this.configs.options = {};
      }
      this.configs.options = {
        initialPage: 0,
        exportButton: true,
        exportCsv: () => {
            alert("Coming soon!")
        },
        ...this.configs.options
      }
    }
    componentDidMount() {
      if(this.props.id) {
        dispatcher.register(this.props.id+"_load_data", () => {
          this.tableRef.current.onQueryChange();
        });
      }
    }
    componentWillUnmount() {
      if(this.props.id) {
        dispatcher.destroy(this.props.id+"_load_data");
      }
    }
    render() {
      return (
        <MaterialTable
          {...this.configs}
          localization={{
            toolbar: {exportName: "Export Excel", exportTitle: "Export Excel"}
          }}
        />
      )
    }
  }