import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaTwitter, FaLinkedin, FaFacebook, FaYoutube } from "react-icons/fa";

const SaaSFooter = () => {
  return (
    <footer className="bg-white text-black py-5 border-top">
      <Container>
        <Row className="mb-4">
          {/* Logo & Description */}
          <Col md={4}>
            <a className="navbar-brand text-primary fw-bold fs-2" href="/">
              Mi-CMS
            </a>
            <p className="text-muted">
              Empowering retailers to deliver personalized customer experiences
              through AI-powered engagement.
            </p>
          </Col>

          {/* Product Links */}
          <Col md={2}>
            <h6 className="fw-bold">Product</h6>
            <ul className="list-unstyled">
              <li>
                <a
                  href="javascript:void(0)"
                  className="text-decoration-none text-muted"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="javascript:void(0)"
                  className="text-decoration-none text-muted"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="javascript:void(0)"
                  className="text-decoration-none text-muted"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="javascript:void(0)"
                  className="text-decoration-none text-muted"
                >
                  Demo
                </a>
              </li>
            </ul>
          </Col>

          {/* Company Links */}
          <Col md={2}>
            <h6 className="fw-bold">Company</h6>
            <ul className="list-unstyled">
              <li>
                <a
                  href="javascript:void(0)"
                  className="text-decoration-none text-muted"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="javascript:void(0)"
                  className="text-decoration-none text-muted"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="javascript:void(0)"
                  className="text-decoration-none text-muted"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="javascript:void(0)"
                  className="text-decoration-none text-muted"
                >
                  Contact
                </a>
              </li>
            </ul>
          </Col>

          {/* Contact Info + Social */}
          <Col md={4}>
            <h6 className="fw-bold">Contact</h6>
            <p className="text-muted mb-1">Email: support@yourdomain.com</p>
            <p className="text-muted mb-3">Phone: +1 (800) 123-4567</p>
            <div className="d-flex gap-3">
              <a href="javascript:void(0)" className="text-dark fs-5">
                <FaTwitter />
              </a>
              <a href="javascript:void(0)" className="text-dark fs-5">
                <FaLinkedin />
              </a>
              <a href="javascript:void(0)" className="text-dark fs-5">
                <FaFacebook />
              </a>
              <a href="javascript:void(0)" className="text-dark fs-5">
                <FaYoutube />
              </a>
            </div>
          </Col>
        </Row>

        <hr />
        <Row className="text-muted small">
          <Col md={6} className="text-start">
            &copy; {new Date().getFullYear()} Your Company. All rights reserved.
          </Col>
          <Col md={6} className="text-end">
            <a
              href="javascript:void(0)"
              className="text-decoration-none text-muted me-3"
            >
              Privacy Policy
            </a>
            <a
              href="javascript:void(0)"
              className="text-decoration-none text-muted"
            >
              Terms of Service
            </a>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default SaaSFooter;
