import * as React from 'react';
import { useEffect, useState } from 'react';
import { ClickEventArgs } from '@syncfusion/ej2-navigations';
import { ColumnsDirective, ColumnDirective, TreeGridComponent, Inject, Toolbar, Page, ExcelExport, PageSettingsModel } from '@syncfusion/ej2-react-treegrid';

// Define an interface for your data structure
interface PrintData {
  jobno: string;
  print_des: string;
  part: string;
  print_ty: string;
  clr: string;
  print_img: string;
  parentID?: string | number; // Required for TreeGrid hierarchy
  [key: string]: any;
}

function Excel() {
  let treegrid: TreeGridComponent | null;
  const [dataSource, setDataSource] = useState<PrintData[]>([]);

  // Fetch data using useEffect (GET Request)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Using standard fetch which defaults to GET (allowed by your server)
        const response = await fetch('https://app.herofashion.com/ord_prn/');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setDataSource(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const toolbarOptions: any[] = ['ExcelExport','PdfExport'];
  const pageOptions: PageSettingsModel = { pageSize: 10 };

  const toolbarClick = (args: ClickEventArgs) => {
    if (treegrid && args.item.text === 'Excel Export') {
      treegrid.excelExport();
    }
  };

  
  return (
    <TreeGridComponent 
      // Bind the state variable instead of DataManager
      dataSource={dataSource} 
      idMapping="jobno" 
      parentIdMapping="parentID" // Ensure your data has a 'parentID' field for hierarchy, or remove this if it's a flat list
      treeColumnIndex={1} 
      pageSettings={pageOptions} 
      toolbarClick={toolbarClick} 
      toolbar={toolbarOptions} 
      allowPaging={true}
      ref={g => treegrid = g} 
      allowExcelExport={true}
    >
      <ColumnsDirective>
        <ColumnDirective field='jobno' headerText='Job No' width='120' isPrimaryKey={true} />
        <ColumnDirective field='print_des' headerText='Description' width='150' />
        <ColumnDirective field='part' headerText='Part' width='100' />
        <ColumnDirective field='print_ty' headerText='Print Type' width='150' />
        <ColumnDirective field='clr' headerText='Colors' width='200' />
        <ColumnDirective 
            field='print_img' 
            headerText='Image' 
            width='150' 
            template={(props: any) => (
                <div className="image">
                    {props.print_img ? (
                        <img src={props.print_img} alt={props.jobno} style={{height: '50px', borderRadius: '4px'}} />
                    ) : (
                        <span>No Img</span>
                    )}
                </div>
            )}
        />
      </ColumnsDirective>
      <Inject services={[Toolbar, Page, ExcelExport]} />
    </TreeGridComponent>
  );
}

export default Excel;