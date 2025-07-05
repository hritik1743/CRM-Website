import React, { useEffect, useState, useRef } from "react";
import API from "../src/api"; // use your centralized axios instance
import axios from "axios";
import toast from "react-hot-toast";

const OrderCard = ({ show, onClose, onOrderAdded }) => {
  const [formData, setFormData] = useState({
    order_id: "",
    customer_id: "",
    amount: "",
    items: "",
    status: "pending",
  });

  const [customerName, setCustomerName] = useState(""); // To store fetched customer name
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerError, setCustomerError] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state
  const [cancelLoading, setCancelLoading] = useState(false);
  const debounceTimeout = useRef();

  // Fetch latest order id when modal shows
  useEffect(() => {
    const fetchNextOrderId = async () => {
      if (show) {
        try {
          const res = await API.get("/api/latest-order-id");
          setFormData((prev) => ({
            ...prev,
            order_id: res.data.nextOrderId,
          }));
        } catch (err) {
          console.error("Failed to fetch order ID", err);
          toast.error("Failed to generate Order ID");
        }
      }
    };
    fetchNextOrderId();
  }, [show]);

  // Fetch customer name whenever customer_id changes and is not empty
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    if (!formData.customer_id.trim()) {
      setCustomerName("");
      setCustomerError(null);
      return;
    }
    debounceTimeout.current = setTimeout(async () => {
      setCustomerLoading(true);
      setCustomerError(null);
      try {
        const res = await API.get(
          `api/customers/${formData.customer_id.trim()}`
        );
        setCustomerName(res.data.name);
      } catch (err) {
        setCustomerName("");
        setCustomerError("Customer not found");
      } finally {
        setCustomerLoading(false);
      }
    }, 1600); // 600ms debounce
    return () => clearTimeout(debounceTimeout.current);
  }, [formData.customer_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true on submit

    // Prevent submission if customer name not found or error exists
    if (customerError || !customerName) {
      toast.error("Please enter a valid Customer ID.");
      setLoading(false); // Reset loading state
      return;
    }

    const payload = {
      ...formData,
      amount: parseFloat(formData.amount),
      items: formData.items.split(",").map((item) => item.trim()),
    };

    try {
      const res = await API.post("/api/add-order", payload);
      if (res.status === 200 || res.status === 201) {
        console.log("Calling onOrderAdded");
        toast.success("Order Successfully Added");
        onOrderAdded(res.data.order); // <--- THIS MUST BE CALLED
        onClose(); // close modal
      }
    } catch (err) {
      console.error("Error adding order:", err.response?.data || err.message);
      toast.error("Failed to add order");
    } finally {
      setLoading(false); // Reset loading state
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
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content p-3">
          <div className="modal-header">
            <h5 className="modal-title">Add Order</h5>
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
                <label className="form-label">Order ID</label>
                <input
                  type="text"
                  name="order_id"
                  className="form-control"
                  value={formData.order_id}
                  disabled // disable editing
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Customer ID</label>
                <input
                  type="text"
                  name="customer_id"
                  className="form-control"
                  value={formData.customer_id}
                  onChange={handleChange}
                  required
                />
                {/* Preview area */}
                <div style={{ marginTop: "5px", minHeight: "24px" }}>
                  {customerLoading && <small>Loading customer...</small>}
                  {!customerLoading && customerName && (
                    <small className="text-success">
                      Customer Name: {customerName}
                    </small>
                  )}
                  {!customerLoading && customerError && (
                    <small className="text-danger">{customerError}</small>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  name="amount"
                  className="form-control"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Items (comma separated)</label>
                <input
                  type="text"
                  name="items"
                  className="form-control"
                  placeholder="e.g. item1, item2"
                  value={formData.items}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
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
                className="btn btn-success"
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
                  "Add Order"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;
