import React, { useRef } from "react";
import { FaUser } from "react-icons/fa";

const Modal = () => {
  const modalRef = useRef();

  const openModal = () => {
    modalRef.current.showModal();
  };

  return (
    <>
     <button  className=" btn btn-neutral h-11 w-11 circl
            e rounded-full mr-6" onClick={openModal}>
         <FaUser  />
     </button>

      <dialog ref={modalRef} id="my_modal_1" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Profile</h3>
          <p className="py-4">Welcome!</p>
          <div className="modal-action">
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
