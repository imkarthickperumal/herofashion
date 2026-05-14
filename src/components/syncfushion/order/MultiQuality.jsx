import React, { useEffect, useState } from "react";

function MultiQuality() {

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);

  const [controllers, setControllers] = useState([]);
  const [filteredControllers, setFilteredControllers] = useState([]);

  const [drawer, setDrawer] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const [searchOrder, setSearchOrder] = useState("");
  const [searchController, setSearchController] = useState("");

  const [selectedControllers, setSelectedControllers] = useState({});

  const [loading, setLoading] = useState(false);


  // LOAD ORDERS
  useEffect(() => {

    fetch("https://app.herofashion.com/order_panda/")
      .then(res => res.json())
      .then(data => {

        setOrders(data);
        setFilteredOrders(data);

        let mapping = {};

        data.forEach(item => {

          if (item.quality_controller) {
            mapping[item.jobno_oms] =
              item.quality_controller.split(",");
          }

        });

        setSelectedControllers(mapping);

      });

  }, []);



  // ORDER SEARCH
  const handleOrderSearch = (value) => {

    setSearchOrder(value);

    const filtered = orders.filter(item =>
      item.jobno_oms.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredOrders(filtered);

  };



  // OPEN DRAWER
  const openDrawer = (jobno_oms) => {

    setActiveOrder(jobno_oms);
    setDrawer(true);

    fetch("https://app.herofashion.com/get_quality_controllers/")
      .then(res => res.json())
      .then(data => {

        setControllers(data);
        setFilteredControllers(data);

      });

  };



  // CONTROLLER SEARCH
  const handleControllerSearch = (value) => {

    setSearchController(value);

    const filtered = controllers.filter(item =>
      item.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredControllers(filtered);

  };



  // SELECT TOGGLE
  const toggleSelect = (value) => {

    let current = selectedControllers[activeOrder] || [];

    if (current.includes(value)) {
      current = current.filter(v => v !== value);
    } else {
      current = [...current, value];
    }

    setSelectedControllers({
      ...selectedControllers,
      [activeOrder]: current
    });

  };



  // SAVE API
  const saveControllers = async () => {

    setLoading(true);

    const controllers = selectedControllers[activeOrder] || [];

    await fetch(
      "https://app.herofashion.com/quality_controler_update/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          jobno_oms: activeOrder,
          controllers: controllers
        })
      }
    );

    setLoading(false);
    setDrawer(false);

    alert("Saved Successfully");

  };



  return (

    <div className="p-4">

      <h1 className="text-xl font-bold mb-4">
        Quality Controller Mapping
      </h1>


      {/* ORDER SEARCH */}

      <input
        type="text"
        placeholder="Search Order No..."
        value={searchOrder}
        onChange={(e) => handleOrderSearch(e.target.value)}
        className="border p-2 mb-4 w-full md:w-1/3 rounded"
      />



      {/* TABLE */}

      <div className="border rounded-lg overflow-hidden">

        {/* HEADER */}

        <div className="grid grid-cols-5 bg-gray-100 font-semibold p-3">

          <div>Image</div>
          <div>Order No</div>
          <div>Quality Controller</div>
          <div>Buyer</div>
          <div>Merch</div>

        </div>



        {/* SCROLL AREA */}

        <div className="max-h-[600px] overflow-y-auto">

          {filteredOrders.map((item, index) => (

            <div
              key={index}
              className="grid grid-cols-5 border-t p-3 items-center gap-2"
            >

              {/* IMAGE */}

              <img
                src={item.mainimagepath}
                alt=""
                className="w-14 h-14 object-cover rounded"
              />



              {/* ORDER NO */}

              <div className="font-medium">
                {item.jobno_oms}
              </div>


              {/* CONTROLLER */}

              <div>

                <button
                  onClick={() => openDrawer(item.jobno_oms)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                >
                  Select Controller
                </button>

                <div className="text-xs text-gray-700 mt-1">

                  {(selectedControllers[item.jobno_oms] || []).join(", ")}

                </div>

              </div>



              {/* BUYER */}

              <div className="text-sm">
                {item.buyer}
              </div>



              {/* MERCH */}

              <div>
                {item.merch}
              </div>



              

            </div>

          ))}

        </div>

      </div>



      {/* SIDE DRAWER */}

      {drawer && (

        <div className="fixed inset-0 flex z-50">

          {/* overlay */}

          <div
            className="bg-black/40 w-full"
            onClick={() => setDrawer(false)}
          />


          {/* panel */}

          <div className="w-full sm:w-[600px] bg-white p-4 shadow-xl">

            <h2 className="text-lg font-semibold mb-3">
              Select Controllers
            </h2>



            {/* SEARCH */}

            <input
              type="text"
              placeholder="Search Controller..."
              value={searchController}
              onChange={(e) =>
                handleControllerSearch(e.target.value)
              }
              className="w-full border p-2 rounded mb-3"
            />



            {/* LIST */}

            <div className="max-h-[600px] overflow-y-auto space-y-2">

              {filteredControllers.map((item, index) => (

                <label
                  key={index}
                  className="flex items-center gap-2 cursor-pointer"
                >

                  <input
                    type="checkbox"
                    checked={
                      selectedControllers[activeOrder]?.includes(item) || false
                    }
                    onChange={() => toggleSelect(item)}
                  />

                  {item}

                </label>

              ))}

            </div>



            {/* SAVE BUTTON */}

            <button
              onClick={saveControllers}
              disabled={loading}
              className="mt-4 w-full bg-green-600 text-white p-2 rounded"
            >

              {loading ? "Saving..." : "Save"}

            </button>

          </div>

        </div>

      )}

    </div>

  );

}

export default MultiQuality;