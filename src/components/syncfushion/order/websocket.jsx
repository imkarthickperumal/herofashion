import React, { useEffect, useRef, useState } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
} from "@syncfusion/ej2-react-grids";

const WS_URL = "wss://app.herofashion.com/ws/orders/";

const OrdersGrid = () => {
  const socketRef = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    if (socketRef.current) return;

    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ Connected");
    };

    socket.onmessage = (event) => {
      console.log("📩 RAW:", event.data);

      const incoming = JSON.parse(event.data);

      setData((prev) => {
        const updated = [...prev];

        const upsert = (row) => {
          const index = updated.findIndex(
            (item) => item.slno === row.slno
          );

          if (index !== -1) {
            updated[index] = row;
          } else {
            updated.push(row);
          }
        };

        if (Array.isArray(incoming)) {
          incoming.forEach(upsert);
        } else {
          upsert(incoming);
        }

        return updated;
      });
    };

    socket.onerror = (err) => {
      console.error("WS Error:", err);
    };

    socket.onclose = (e) => {
      console.log("Closed:", e.code);
    };

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  return (
    <GridComponent
      dataSource={data}
      allowPaging={true}
      pageSettings={{ pageSize: 10 }}
    >
      <ColumnsDirective>
        <ColumnDirective
          field="slno"
          headerText="SL No"
          isPrimaryKey={true}
          width="100"
        />
        <ColumnDirective field="jobno_oms" headerText="Job No" width="130" />
        <ColumnDirective field="buyer" headerText="Buyer" width="180" />
        <ColumnDirective field="stylename" headerText="Style" width="150" />
        <ColumnDirective field="printing_R" headerText="printing_R" width="150" />
        <ColumnDirective field="quantity" headerText="Qty" width="100" />
        <ColumnDirective
          field="shipment_complete"
          headerText="Status"
          width="130"
        />
      </ColumnsDirective>

      <Inject services={[Page]} />
    </GridComponent>
  );
};

export default OrdersGrid;