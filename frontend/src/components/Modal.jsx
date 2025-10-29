import React, { useRef } from "react";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Modal = () => {
  const modalRef = useRef();
  const { user, logout } = useAuth(); 
  const navigate = useNavigate();

  const openModal = () => {
    modalRef.current.showModal();
  };

  const handleLogout = () => {
    logout(); 
    modalRef.current.close(); 
    navigate("/login"); 
  };

  return (
    <>
    {/* open modal btn */}
      <button
        className="btn btn-neutral h-11 w-11 circle rounded-full mr-6"
        onClick={openModal}
      >
        <FaUser />
      </button>

      <dialog ref={modalRef} id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">
            {user 
                ? `Profile: ${user.username} (${user.role.toUpperCase()})` 
                : "Profile"}
          </h3>
          <p className="py-4">
            {user 
                ? `You are signed in as a ${user.role}.` 
                : "Please log in to view your profile."}
          </p>

          <div className="flex justify-between items-center modal-action mt-0 pt-0">
            {user && (
                <button
                    onClick={handleLogout}
                    className="btn btn-error"
                >
                    Logout
                </button>
            )}
            
            {/* Close Button */}
            <form method="dialog">
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default Modal;