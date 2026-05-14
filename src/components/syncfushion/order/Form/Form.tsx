import { useState, useEffect, useRef } from 'react';
import * as React from "react";

import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { FormValidator } from '@syncfusion/ej2-inputs';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import { AutoCompleteComponent } from '@syncfusion/ej2-react-dropdowns';

import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Page,
  Sort,
  Filter
} from '@syncfusion/ej2-react-grids';

import './style.css';

let formObject: FormValidator;

function Form() {

  const buyerRef = useRef<any>(null);

  const [buyerData, setBuyerData] = useState<any[]>([]);
  const [gridData, setGridData] = useState<any[]>([]);

  const [orderno, setOrderno] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<any>(null);

  const [selectedBuyer, setSelectedBuyer] = useState<any>({
    buyerid: '',
    buyername: ''
  });

  // ================= LOAD API =================
  useEffect(() => {
    fetch("https://app.herofashion.com/web_socket/")
      .then((res) => res.json())
      .then((data) => {
        setBuyerData(data);
        setGridData(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // ================= VALIDATOR =================
  useEffect(() => {
    const options = {
      rules: {
        buyerid: {
          required: [true, '* Please select buyer id'],
        },
        orderno: {
          required: [true, '* Please enter order no'],
        },
        date: {
          required: [true, '* Please select date'],
        }
      }
    };

    formObject = new FormValidator('#form1', options);
  }, []);

  // ================= BUYER SELECT =================
  const onBuyerSelect = (e: any) => {
    const item = e.itemData;

    if (item) {
      setSelectedBuyer({
        buyerid: item.buyerid,
        buyername: item.buyername
      });
    }
  };

  // ================= DATE CHANGE =================
  const dateChangeHandler = (e: any) => {
    setDateOfBirth(e.value);
  };

  // ================= SUBMIT =================
  const onSubmit = async () => {

    if (formObject.validate()) {

      const payload = {
        planno: Number(selectedBuyer.buyerid),
        ordid: Number(orderno),
        shipreqd: dateOfBirth
          ? `${new Date(dateOfBirth).toISOString().split('T')[0]} 00:00:00.000`
          : null
      };

      try {

        const response = await fetch(
          "https://app.herofashion.com/order_ship_plan/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
          }
        );

        const result = await response.json();

        console.log("Saved:", result);

        // update grid
        setGridData([
          ...gridData,
          {
            buyerid: selectedBuyer.buyerid,
            orderno: orderno,
            date: payload.shipreqd,
            refresh: "Saved"
          }
        ]);

        alert("Saved Successfully!");

        // Reset Form
        (formObject as any).element.reset();

        setDateOfBirth(null);
        setOrderno('');

        setSelectedBuyer({
          buyerid: '',
          buyername: ''
        });

      } catch (error) {
        console.error(error);
        alert("API Error");
      }
    }
  };

  // ================= UI =================
  return (
    <div className="page-container">

      {/* FORM CARD */}
      <div className="form-card">

        <h2 className="form-title">
          Order Ship Plan Form
        </h2>

        <form id="form1" className="form-grid">

          {/* Buyer ID */}
          <div className="form-group">
            <AutoCompleteComponent
              ref={buyerRef}
              name="buyerid"
              dataSource={buyerData}
              fields={{ value: 'buyerid' }}
              placeholder="Buyer ID"
              change={onBuyerSelect}
              filterType="Contains"
              floatLabelType="Auto"
              data-msg-containerid="errorBuyer"
            />
            <div id="errorBuyer" />
          </div>

          {/* Buyer Name */}
          <div className="form-group">
            <TextBoxComponent
              value={selectedBuyer.buyername}
              placeholder="Buyer Name"
              readonly={true}
              floatLabelType="Auto"
            />
          </div>

          {/* Order No */}
          <div className="form-group">
            <TextBoxComponent
              name="orderno"
              value={orderno}
              change={(e: any) => setOrderno(e.value)}
              placeholder="Order No"
              floatLabelType="Auto"
              data-msg-containerid="errorOrder"
            />
            <div id="errorOrder" />
          </div>

          {/* Date */}
          <div className="form-group">
            <DatePickerComponent
              name="date"
              value={dateOfBirth}
              change={dateChangeHandler}
              placeholder="Ship Required Date"
              floatLabelType="Auto"
              data-msg-containerid="errorDate"
            />
            <div id="errorDate" />
          </div>

        </form>

        {/* Submit */}
        <div className="form-actions">
          <ButtonComponent
            cssClass="e-primary"
            onClick={onSubmit}
          >
            Submit
          </ButtonComponent>
        </div>

      </div>

      {/* GRID */}
      <div className="grid-card">

        <GridComponent
          dataSource={gridData}
          allowPaging={true}
          allowSorting={true}
          height={350}
        >
          <ColumnsDirective>
            <ColumnDirective field="buyerid" headerText="Buyer ID" width="150" />
            <ColumnDirective field="buyername" headerText="Buyer Name" width="200" />
            <ColumnDirective field="orderno" headerText="Order No" width="150" />
            <ColumnDirective field="date" headerText="Ship Date" width="180" />
            <ColumnDirective field="refresh" headerText="Status" width="150" />
          </ColumnsDirective>

          <Inject services={[Page, Sort, Filter]} />
        </GridComponent>

      </div>

    </div>
  );
}

export default Form;