import React, { useState, useEffect } from 'react';
import { GridComponent, ColumnsDirective, ColumnDirective, Selection, Inject, Page } from '@syncfusion/ej2-react-grids';

function MasterDetail() {
    const [allOrders, setAllOrders] = useState([]); 
    const [masterData, setMasterData] = useState([]); 
    const [detailData, setDetailData] = useState([]); 
    const [selectedPO, setSelectedPO] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch('https://app.herofashion.com/order_panda');
                const data = await response.json();
                
                // Set all data from API
                setAllOrders(data);
                setMasterData(data); 
            } catch (error) {
                console.error("Fetch error:", error);
            }
        };
        fetchOrders();
    }, []);

    // Custom Formatter for "14 wk 25 Y"
    const formatDateValue = (field, data) => {
        const dateStr = data[field]; // Expecting "2026-03-28T00:00:00"
        if (!dateStr) return '';
        
        const date = new Date(dateStr);
        const year = date.getFullYear().toString().slice(-2);
        
        // Calculate Week Number
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - startOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
        
        return `${weekNum} wk ${year} Y`;
    };

    const rowselect = (args) => {
        const selRecord = args.data;
        setSelectedPO(selRecord.pono);
        const details = allOrders.filter(item => item.pono === selRecord.pono);
        setDetailData(details);
    };

    const imageTemplate = (props) => (
        <div className="image">
            <img src={props.mainimagepath} alt="Order" style={{ width: '50px', borderRadius: '4px' }} />
        </div>
    );

    return (
        <div className='control-pane' style={{ padding: '20px' }}>
            <div className='control-section'>
                <h3>Order Master (Total Records: {masterData.length})</h3>
                <GridComponent 
                    dataSource={masterData} 
                    selectedRowIndex={0} 
                    rowSelected={rowselect}
                    allowPaging={true}
                    pageSettings={{ pageSize: 10 }}
                >
                    <ColumnsDirective>
                        <ColumnDirective field='pono' headerText='PO No' width='120' />
                        <ColumnDirective field='company_name' headerText='Company' width='100' />
                        <ColumnDirective field='stylename' headerText='Style Name' width='150' />
                        {/* Custom Week/Year Format Column */}
                        <ColumnDirective 
                            field='finaldelvdate1' 
                            headerText='Delivery Week' 
                            width='130' 
                            valueAccessor={(field, data) => formatDateValue(field, data)} 
                        />
                        <ColumnDirective field='season' headerText='Season' width='100' />
                    </ColumnsDirective>
                    <Inject services={[Selection, Page]} />
                </GridComponent>

                <div style={{ margin: '20px 0', fontSize: '16px' }}>
                    Orders for PO: <b>{selectedPO}</b>
                </div>

                <GridComponent dataSource={detailData} allowPaging={true}>
                    <ColumnsDirective>
                        <ColumnDirective headerText='Image' width='100' template={imageTemplate} textAlign='Center' />
                        <ColumnDirective field='jobno_oms' headerText='Job No' width='120' />
                        <ColumnDirective field='styledesc' headerText='Description' width='200' />
                        <ColumnDirective field='quality_controller' headerText='QC' width='150' />
                        <ColumnDirective field='order_follow_up' headerText='Status' width='150' />
                    </ColumnsDirective>
                    <Inject services={[Page]} />
                </GridComponent>
            </div>
        </div>
    );
}

export default MasterDetail;
