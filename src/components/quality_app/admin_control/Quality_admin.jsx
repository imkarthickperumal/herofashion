import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../../../auth/auth";


function Quality_admin() {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [data, setQcdatas] = useState([]);

  useEffect(() => {
    fetch_qcdata();
  }, []);

  const fetch_qcdata = async () => {
    try {
      const res = await api.get("qcapp/qcadmin_mistakes/");
      setQcdatas(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(data.map((item) => item.category))),
  ];

  const filteredData =
    categoryFilter === "All"
      ? data
      : data.filter((item) => item.category === categoryFilter);

  // CREATE
  const handleAdd = async (formData) => {
    try {
      const res = await api.post("qcapp/qcadmin_mistakes/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setQcdatas([...data, res.data]);
      setShowAddModal(false);
    } catch (err) {
      console.error("Create Error:", err);
    }
  };

  // UPDATE
  const handleUpdate = async (id, formData) => {
  try {
    const res = await api.patch(
      `qcapp/qcadmin_mistakes/${id}/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setQcdatas(data.map((item) => (item.id === id ? res.data : item)));
    setShowEditModal(false);
  } catch (err) {
    console.error("Update Error:", err.response?.data);
  }
};

  // DELETE
  const handleDelete = async (id) => {
    try {
      await api.delete(`qcapp/qcadmin_mistakes/${id}/`);
      setQcdatas(data.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setShowEditModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between md:mt-12 sm:mt-14">
        <div>
          <h2 className="text-2xl font-bold mb-4">Welcome Quality Admin</h2>

          <Link to="qc" className="inline-block text-blue-600 underline mb-6">
            Go to QC Page
          </Link>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-1 h-10 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Add Item
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Filter by Category:</label>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Image</th>
              <th className="px-4 py-2">Category</th>
              <th className="px-4 py-2">Edit</th>
              <th className="px-4 py-2">Delete</th>
            </tr>
          </thead>

          <tbody>
            {filteredData.map((item) => (
              <tr key={item.id} className="border-t text-center">
                <td className="px-4 py-2">{item.name}</td>

                <td className="px-4 py-2 justify-items-center">
                  <img
                    src={`https://hfapi.herofashion.com${item.image}`}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>

                <td className="px-4 py-2">{item.category}</td>

                <td className="px-4 py-2 ">
                  <button
                    onClick={() => handleEdit(item)}
                    className="px-3 py-1 bg-orange-500 text-white rounded"
                  >
                    Edit
                  </button>
                </td>

                <td className="px-4 py-2">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal
          title="Add Item"
          onClose={() => setShowAddModal(false)}
          onSubmit={(formData) => handleAdd(formData)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && currentItem && (
        <Modal
          title="Edit Item"
          item={currentItem}
          onClose={() => setShowEditModal(false)}
          onSubmit={(formData) => handleUpdate(currentItem.id, formData)}
        />
      )}
    </div>
  );
}

function Modal({ title, onClose, onSubmit, item }) {
  const [name, setName] = useState(item?.name || "");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState(item?.category || "");

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);

    if (image) {
      formData.append("image", image);
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/40">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h3 className="text-lg font-bold mb-4">{title}</h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border px-2 py-1 rounded"
          />

          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="border px-2 py-1 rounded"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option value="">Select Category</option>
            <option value="Minor Defects">Minor Defects</option>
            <option value="Major Defects">Major Defects</option>
            <option value="Critical Defects">Critical Defects</option>
            <option value="rowing_qc">Rowing Qc</option>
          </select>

          <div className="flex justify-end gap-2 mt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 bg-gray-300 rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-3 py-1 bg-blue-500 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Quality_admin;