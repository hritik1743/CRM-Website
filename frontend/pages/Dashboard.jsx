import React, { useEffect, useState } from "react";
import CustomerCard from "../utils/CustomerCard";
import OrderCard from "../utils/OrderCard";
import API from "../src/api"; // adjust path as needed
import CampaignCard from "../utils/CampaignCard";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [data, setData] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [visibleCountOC, setVisibleCountOC] = useState(5);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingMoreCustomers, setLoadingMoreCustomers] = useState(false);
  const [loadingMoreOrders, setLoadingMoreOrders] = useState(false);
  const [loadingAddCampaign, setLoadingAddCampaign] = useState(false);

  // Reusable fetch function
  const fetchData = () => {
    setLoading(true);
    API.get("/api/get-dashboard-data") // your actual API route here
      .then((res) => {
        setData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
        // Check if error is due to unauthorized/session expiry
        if (
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        ) {
          toast.error("Session expired. Please login again.");
          navigate("/login");
        }
      });
  };

  // Check auth status before loading dashboard
  useEffect(() => {
    API.get("/api/auth/status")
      .then((res) => {
        if (!res.data.isLoggedIn) {
          toast.error("Please login to access dashboard");
          navigate("/login");
          return;
        }
        // Only fetch dashboard data if logged in
        fetchData();
      })
      .catch((err) => {
        console.error("Auth check failed:", err);
        toast.error("Session expired. Please login again.");
        navigate("/login");
      });
  }, [navigate]);

  if (loading)
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex justify-content-center align-items-center"
        style={{ zIndex: 1050 }}
      >
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  // Handler for Load More button
  const loadMoreOC = () => {
    setLoadingMoreOrders(true);
    setTimeout(() => {
      setVisibleCountOC((prev) => prev + 5);
      setLoadingMoreOrders(false);
    }, 500);
  };

  const orderToShow = data.orders.slice(0, visibleCountOC);
  const loadMore = () => {
    setLoadingMoreCustomers(true);
    setTimeout(() => {
      setVisibleCount((prev) => prev + 5);
      setLoadingMoreCustomers(false);
    }, 500);
  };

  const customersToShow = data.customers.slice(0, visibleCount);

  const operatorMap = {
    $gt: ">",
    $lt: "<",
    $gte: ">=",
    $lte: "<=",
    $eq: "=",
    $ne: "≠",
  };

  const getReadableLogic = (segment) => {
    if (!segment || typeof segment !== "object") return "N/A";

    return Object.entries(segment)
      .map(([field, condition]) => {
        if (typeof condition === "object") {
          return Object.entries(condition)
            .map(
              ([op, value]) =>
                `${field} ${operatorMap[op] || op} ${JSON.stringify(value)}`
            )
            .join(" AND ");
        } else {
          return `${field} = ${JSON.stringify(condition)}`;
        }
      })
      .join(" AND ");
  };

  const handleViewLogs = (campaign) => {
    navigate(`/dashboard/${campaign._id}`);
  };

  return (
    <>
      <div
        className="container my-5"
        style={{ display: loading ? "none" : "block" }}
      >
        <div className="min-h-[300px] bg-dark absolute w-full"></div>

        <h2 className="mb-3">Welcome, {data.name}</h2>
        <div>
          <button
            className="btn btn-primary me-2"
            onClick={() => setShowCustomerModal(true)}
          >
            Add Customer
          </button>
          <button
            className="btn btn-success me-2"
            onClick={() => setShowOrderModal(true)}
          >
            Add Order
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              const campaignElement =
                document.getElementById("campaign-section");
              if (campaignElement) {
                campaignElement.scrollIntoView({ behavior: "smooth" });
              }
            }}
          >
            ↓ Campaign
          </button>
        </div>
        <OrderCard
          show={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onOrderAdded={(data) => {
            console.log("Order added:", data);
            setShowOrderModal(false); // <-- close modal explicitly here
            fetchData();
          }}
        />
        <CustomerCard
          show={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onCustomerAdded={(data) => {
            console.log("Customer added:", data);
            fetchData();
          }}
        />

        <main className="main-content relative rounded-lg">
          <div className="container-fluid py-4">
            <div className="row">
              {/* Card 1 */}
              <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div className="card">
                  <div className="card-body p-3">
                    <div className="row">
                      <div className="col-8">
                        <div className="numbers">
                          <p className="text-sm mb-0 text-uppercase font-weight-bold">
                            Total Money Spent
                          </p>
                          <h5 className="font-weight-bolder">
                            ₹ {data.totalAmountSpent}
                          </h5>
                          <p className="mb-0">
                            <span className="text-success text-sm font-weight-bolder">
                              +55%
                            </span>{" "}
                            since yesterday
                          </p>
                        </div>
                      </div>
                      <div className="col-4 text-end">
                        <div className="icon icon-shape bg-gradient-primary shadow-primary text-center rounded-circle">
                          <i
                            className="ni ni-money-coins text-lg opacity-10"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div className="card">
                  <div className="card-body p-3">
                    <div className="row">
                      <div className="col-8">
                        <div className="numbers">
                          <p className="text-sm mb-0 text-uppercase font-weight-bold">
                            Total Users
                          </p>
                          <h5 className="font-weight-bolder">
                            {data.totalCustomers}
                          </h5>
                          <p className="mb-0">
                            <span className="text-success text-sm font-weight-bolder">
                              +3%
                            </span>{" "}
                            since last week
                          </p>
                        </div>
                      </div>
                      <div className="col-4 text-end">
                        <div className="icon icon-shape bg-gradient-danger shadow-danger text-center rounded-circle">
                          <i
                            className="ni ni-world text-lg opacity-10"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                <div className="card">
                  <div className="card-body p-3">
                    <div className="row">
                      <div className="col-8">
                        <div className="numbers">
                          <p className="text-sm mb-0 text-uppercase font-weight-bold">
                            Total Orders
                          </p>
                          <h5 className="font-weight-bolder">
                            {data.totalOrders}
                          </h5>
                          <p className="mb-0">
                            <span className="text-danger text-sm font-weight-bolder">
                              -2%
                            </span>{" "}
                            since last quarter
                          </p>
                        </div>
                      </div>
                      <div className="col-4 text-end">
                        <div className="icon icon-shape bg-gradient-success shadow-success text-center rounded-circle">
                          <i
                            className="ni ni-paper-diploma text-lg opacity-10"
                            aria-hidden="true"
                          ></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <div className="container-fluid mt-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">All Users</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Customer ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Total Spent</th>
                      <th>Total Orders</th>
                      <th>Last Order Date</th>
                      <th>Signup Date</th>
                      <th>Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customersToShow.map((customer) => (
                      <tr key={customer._id}>
                        <td>{customer.customer_id}</td>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phone}</td>
                        <td>₹{customer.total_spent}</td>
                        <td>{customer.total_orders}</td>
                        <td>
                          {customer.last_order_date
                            ? new Date(
                                customer.last_order_date
                              ).toLocaleDateString()
                            : "-"}
                        </td>
                        <td>
                          {new Date(customer.signup_date).toLocaleDateString()}
                        </td>
                        <td>
                          {customer.is_active ? (
                            <span className="badge bg-success">Yes</span>
                          ) : (
                            <span className="badge bg-danger">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Show Load More only if there are more customers to show */}
                {visibleCount < data.customers.length && (
                  <div className="text-center my-3">
                    <button
                      className="btn btn-primary"
                      onClick={loadMore}
                      disabled={loadingMoreCustomers}
                    >
                      {loadingMoreCustomers ? (
                        <span>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Loading...
                        </span>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="container-fluid mt-5">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">Orders</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Customer ID</th>
                      <th>Amount</th>
                      <th>Items</th>
                      <th>Order Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderToShow.map((order) => (
                      <tr key={order._id}>
                        <td>{order.order_id}</td>
                        <td>{order.customer_id}</td>
                        <td>₹{order.amount}</td>
                        <td>{order.items.join(", ")}</td>
                        <td>
                          {new Date(order.order_date).toLocaleDateString()}
                        </td>
                        <td>
                          <span
                            className={
                              order.status.toLowerCase() === "completed"
                                ? "badge bg-success"
                                : order.status.toLowerCase() === "pending"
                                ? "badge bg-warning"
                                : "badge bg-secondary"
                            }
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Show Load More only if there are more customers to show */}
                {visibleCountOC < data.orders.length && (
                  <div className="text-center my-3">
                    <button
                      className="btn btn-info"
                      onClick={loadMoreOC}
                      disabled={loadingMoreOrders}
                    >
                      {loadingMoreOrders ? (
                        <span>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Loading...
                        </span>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div id="campaign-section" className="container-fluid mt-5">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center bg-secondary text-white">
              <h5 className="mb-0">Campaigns</h5>
              <button
                className="btn btn-light text-dark fw-bold"
                onClick={() => {
                  setLoadingAddCampaign(true);
                  setShowCampaignModal(true);
                  setTimeout(() => setLoadingAddCampaign(false), 500);
                }}
                disabled={loadingAddCampaign}
              >
                {loadingAddCampaign ? (
                  <span>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Adding...
                  </span>
                ) : (
                  "+ Add Campaign"
                )}
              </button>
              {/* CampaignCard modal */}
              <CampaignCard
                show={showCampaignModal}
                onClose={() => setShowCampaignModal(false)}
                onCampaignCreated={(newCampaign) => {
                  setCampaigns((prev) => [newCampaign, ...prev]);
                  fetchData();
                }}
              />
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Campaign Name</th>
                      <th>Audience Size</th>
                      <th>Campaign Logic</th>
                      <th>View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.campaigns.map((campaign) => (
                      <tr key={campaign._id}>
                        <td>{campaign.name}</td>
                        <td>{campaign.audienceSize}</td>
                        <td>{getReadableLogic(campaign.audienceSegment)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-primary me-2"
                            onClick={() => handleViewLogs(campaign)}
                          >
                            View Logs
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
