import React, { useEffect, useState } from "react";
import axios from "axios";
import API from "../src/api"; // adjust the path as needed
import toast from "react-hot-toast";

const CustomerCard = ({ show, onClose, onCustomerAdded }) => {
  const [formData, setFormData] = useState({
    customer_id: "",
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    const fetchNextCustomerId = async () => {
      if (show) {
        try {
          const res = await API.get("/api/latest-customer-id");
          setFormData((prev) => ({
            ...prev,
            customer_id: res.data.nextCustomerId,
          }));
        } catch (err) {
          console.error("Failed to fetch customer ID", err);
          toast.error("Failed to generate Customer ID");
        }
      }
    };
    fetchNextCustomerId();
  }, [show]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/api/add-customer", formData);
      if (res.status === 200 || res.status === 201) {
        toast.success("Customer Sucessfully Added");
        onCustomerAdded(res.data.customer); // optional callback
        onClose(); // close modal
      }
    } catch (err) {
      console.error(
        "Error adding customer:",
        err.response?.data || err.message
      );
      toast.error("Failed to add customer");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setCancelLoading(true);
    setTimeout(() => {
      setCancelLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div
      className={`modal fade ${show ? "show d-block" : ""}`}
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title">Add Customer</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Customer ID</label>
                <input
                  type="text"
                  name="customer_id"
                  className="form-control"
                  value={formData.customer_id}
                  disabled
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? (
                  <span>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Cancelling...
                  </span>
                ) : (
                  "Cancel"
                )}
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Adding...
                  </span>
                ) : (
                  "Add Customer"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
