import { useState } from "react";
import { Form, Button, ToggleButtonGroup, ToggleButton } from "react-bootstrap";
import { FaRobot } from "react-icons/fa";
import API from "../src/api"; // import your axios instance

const CommunicationCard = ({ campaign, onClose, refreshCampaign }) => {
  const [message, setMessage] = useState("");
  const [modes, setModes] = useState(["email"]);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleGenerateAIMessage = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    console.log(campaign);

    try {
      // Example: POST to your AI message generation endpoint
      const response = await API.post("/api/generate-message", {
        campaignId: campaign._id,
        segment: campaign.audienceSegment, // or any segment data you want to send
      });

      if (response.data && response.data.generatedMessage) {
        setMessage(response.data.generatedMessage);
      } else {
        setError("Failed to generate AI message.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Error generating AI message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await API.post("/api/communication-log", {
        campaignId: campaign._id,
        message,
        modes,
      });

      if (response.data.success) {
        setSuccess("Communication log saved successfully.");
        onClose();
        refreshCampaign();
      } else {
        setError("Failed to save communication log.");
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Something went wrong. Please try again."
      );
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
    <Form>
      <Form.Group className="mb-4">
        <Form.Label className="fw-semibold">Mode of Communication</Form.Label>
        <ToggleButtonGroup
          type="checkbox"
          value={modes}
          onChange={setModes}
          className="d-flex gap-2"
        >
          <ToggleButton
            id="mode-email"
            value="email"
            variant={modes.includes("email") ? "primary" : "outline-primary"}
          >
            Email
          </ToggleButton>
          <ToggleButton
            id="mode-mobile"
            value="mobile"
            variant={modes.includes("mobile") ? "primary" : "outline-primary"}
          >
            Mobile
          </ToggleButton>
        </ToggleButtonGroup>
      </Form.Group>

      <Form.Group className="mb-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Form.Label className="fw-semibold mb-0">
            Customized Message
          </Form.Label>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleGenerateAIMessage}
            disabled={loading}
          >
            {loading ? (
              <span>
                <span
                  className="spinner-border spinner-border-sm me-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                Generating...
              </span>
            ) : (
              <>
                <FaRobot className="me-1" /> AI Generated
              </>
            )}
          </Button>
        </div>
        <Form.Control
          as="textarea"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write your custom message here..."
          className="shadow-sm"
        />
      </Form.Group>

      {error && <div className="text-danger mb-3">{error}</div>}
      {success && <div className="text-success mb-3">{success}</div>}

      <div className="d-flex justify-content-end mt-4">
        <Button
          variant="secondary"
          onClick={handleCancel}
          className="me-2"
          disabled={cancelLoading}
        >
          {cancelLoading ? (
            <span>
              <span
                className="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              ></span>
              Cancelling...
            </span>
          ) : (
            "Cancel"
          )}
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={loading}>
          {loading ? (
            <span>
              <span
                className="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              ></span>
              Sending...
            </span>
          ) : (
            "Send Communication"
          )}
        </Button>
      </div>
    </Form>
  );
};

export default CommunicationCard;
