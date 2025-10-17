import React from "react";

function Footer() {
  return (
    <footer className="bg-dark text-light py-3 mt-5">
      <div className="container text-center">
        <p className="mb-0">© {new Date().getFullYear()} GigConnect. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
