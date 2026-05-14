import * as React from "react";
import { useEffect, useState, useRef, useMemo } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Filter,
  Inject,
  Edit,
  Sort,
  ForeignKey,
  Toolbar,
  InfiniteScroll
} from "@syncfusion/ej2-react-grids";

function ForeignKeyColumn() {
  const gridRef = useRef(null);

  interface OrderRow {
    mainimagepath : string;
  }

  const [orderData, setOrderData] = useState<OrderRow[]>([]);
  const [printData, setPrintData] = useState([]);

    const imageTemplate = (props: OrderRow) => {
      const src = props?.mainimagepath
    ? props.mainimagepath
    : "/placeholder.png";
      
      return (
        <img
      src={src}
      width={50}
      height={50}
      style={{ display: "block" }}
      onError={(e: any) => {
        e.target.src = "/placeholder.png";
      }}
      alt="img"
    />
      );
    };

  const toolbarOptions = ["Add", "Edit", "Delete", "Update", "Cancel", "Search"];
  const validationRules = { required: true };

  const gridContent = useMemo(
    () => (
      <GridComponent
        dataSource={orderData}
        ref={gridRef}
        allowFiltering={true}
        enableInfiniteScrolling={true}
        height={700}
        pageSettings={{pageSize:20}}
        allowSorting={true}
        editSettings={{
          allowEditing: true,
          allowDeleting: true,
          allowAdding: true
        }}
        filterSettings={{ type: "Menu" }}
        toolbar={toolbarOptions}
      >
        <ColumnsDirective>

          <ColumnDirective field="jobno_oms" headerText="RGB Job" width="180" foreignKeyField="jobno_oms" foreignKeyValue="print_type" dataSource={printData} />
          <ColumnDirective field="buyer1" headerText="Emp" width="180" foreignKeyField="buyer1" foreignKeyValue="print_img_pen" dataSource={printData} />
          <ColumnDirective headerText="Image" width="150" template={imageTemplate} />
          <ColumnDirective field="buyer" headerText="Buyer" width="150" />
          <ColumnDirective field="style" headerText="Style" width="150" />
        </ColumnsDirective>

        <Inject services={[Filter, InfiniteScroll,Edit, Sort, ForeignKey, Toolbar]} />
      </GridComponent>
    ),
    [orderData, printData, imageTemplate, toolbarOptions]
  );

  // 🔥 Fetch APIs
  useEffect(() => {
    fetch("https://app.herofashion.com/order_panda/")
      .then((res) => res.json())
      .then((data) => {
        setOrderData(data);
      });

    fetch("https://app.herofashion.com/PrintRgb/")
      .then((res) => res.json())
      .then((data) => {
        setPrintData(data);
      });
  }, []);

  return (
    <div className="control-pane">
      <div className="control-section">
         {orderData.length > 0 && printData.length > 0 && gridContent}
      </div>
    </div>
  );  
}

export default ForeignKeyColumn;