import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../src/api"; // adjust path as needed
import toast from "react-hot-toast";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Button,
  Table,
  Modal,
  ListGroup,
} from "react-bootstrap";
import { FaUsers, FaCog, FaPlusCircle } from "react-icons/fa";
import CommunicationCard from "../utils/CommunicationCard";

const CampaignLog = () => {
  const { logId } = useParams();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCommModal, setShowCommModal] = useState(false);
  const [loadingCreateLog, setLoadingCreateLog] = useState(false);

  const fetchCampaign = async () => {
    try {
      const res = await API.get(`/api/campaign/${logId}`);
      setCampaign(res.data);
      console.log(res.data);
    } catch (err) {
      toast.error("Error fetching campaign log");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
  }, [logId]);

  const handleCreateLog = () => {
    setLoadingCreateLog(true);
    setShowCommModal(true);
    setTimeout(() => setLoadingCreateLog(false), 500); // fallback: reset after modal opens
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p>Loading log details...</p>
      </Container>
    );
  }

  if (!campaign) {
    return (
      <Container className="text-center mt-5">
        <h4>Campaign not found.</h4>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-3">
        <Col>
          <h2>📊 Campaign Dashboard</h2>
        </Col>
        <Col className="text-end">
          <Button
            variant="success"
            onClick={handleCreateLog}
            disabled={loadingCreateLog}
          >
            {loadingCreateLog ? (
              <span>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Creating...
              </span>
            ) : (
              <>
                <FaPlusCircle className="me-2" />
                Create Communication Log
              </>
            )}
          </Button>
        </Col>
      </Row>

      <Modal
        show={showCommModal}
        onHide={() => setShowCommModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Create Communication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CommunicationCard
            campaign={campaign}
            onClose={() => setShowCommModal(false)}
            refreshCampaign={fetchCampaign} // 🔥 Pass it here
          />
        </Modal.Body>
      </Modal>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title>{campaign.name}</Card.Title>
          <Row>
            <Col md={6}>
              <p>
                <FaUsers className="me-2 text-primary" />
                <strong>Audience Size:</strong> {campaign.audienceSize}
              </p>
            </Col>
            <Col md={6}>
              <p>
                <FaCog className="me-2 text-info" />
                <strong>Segment Logic:</strong>{" "}
                {JSON.stringify(campaign.audienceSegment)}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title>🎯 Audience Detail</Card.Title>
          {campaign.customers.length > 0 ? (
            <Table responsive bordered hover>
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {campaign.customers.map((customer, index) => (
                  <tr key={customer._id || index}>
                    <td>{index + 1}</td>
                    <td>{customer.name}</td>
                    <td>{customer.email}</td>
                    <td>{customer.phone}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No customers in this audience segment.</p>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header>
          <h5>📬 Communication Logs</h5>
        </Card.Header>
        <Card.Body>
          {campaign.communicationLog.length > 0 ? (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Message</th>
                  <th>Modes</th>
                  <th>Total</th>
                  <th>Sent</th>
                  <th>Failed</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {campaign.communicationLog.map((log, index) => (
                  <tr key={log._id || index}>
                    <td>{index + 1}</td>
                    <td style={{ whiteSpace: "pre-wrap", maxWidth: "300px" }}>
                      {log.message}
                    </td>
                    <td>{log.modes.join(", ")}</td>
                    <td>{log.stats?.total ?? "-"}</td>
                    <td>{log.stats?.sent ?? "-"}</td>
                    <td>{log.stats?.failed ?? "-"}</td>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No communication logs available.</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CampaignLog;
