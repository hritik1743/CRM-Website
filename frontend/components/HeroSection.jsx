import React from "react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

const HeroSection = () => {
  return (
    <section className="hero-section d-flex align-items-center min-vh-100 bg-light pt-4 pt-sm-0">
      <div className="container">
        <div className="row align-items-center">
          {/* Text Content */}
          <motion.div
            className="col-lg-6 mb-5 mb-lg-0 text-start"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="display-5 fw-bold">
              <span className="text-primary">Maximise Repeat Revenue</span>
              <br />
              with <span className="text-dark">10x easier personalisation</span>
            </h1>
            <p className="text-secondary mt-3 fs-5">
              Unify customer data, generate insights, personalise marketing
              communications across SMS, Email, Whatsapp & Instagram to delight
              your loyal customers.
            </p>
            <form
              className="d-flex mt-4 flex-column flex-sm-row"
              style={{ maxWidth: "500px" }}
            >
              <input
                type="email"
                className="form-control me-sm-2 mb-2 mb-sm-0 p-3"
                placeholder="Enter Your Email"
              />
              <button className="btn btn-primary px-4" type="submit">
                Subscribe
              </button>
            </form>
          </motion.div>

          {/* Image Content */}
          <motion.div
            className="col-lg-6 text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img
              src="/cms.png"
              alt="Hero Visual"
              className="img-fluid hero-image"
              style={{
                maxHeight: "400px",
                width: "100%",
                objectFit: "contain",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
